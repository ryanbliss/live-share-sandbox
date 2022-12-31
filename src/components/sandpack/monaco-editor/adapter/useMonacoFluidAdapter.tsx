import { useMonaco } from "@monaco-editor/react";
import { SequenceDeltaEvent, SharedString } from "fluid-framework";
import { MergeTreeDeltaType, TextSegment } from "@fluidframework/merge-tree";
import { useCallback, useEffect, useRef } from "react";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { SandpackFile, useSandpack } from "@codesandbox/sandpack-react";
import { MonacoPackageLoader } from "./package-loader/MonacoPackageLoader";
import { LiveSharePackages } from "./package-loader/packages/LiveSharePackages";
import { useStateRef } from "../../../../hooks";
import { useMonacoPresenceCursors } from "./presence-cursors/useMonacoPresenceCursors";
import { useFluidObjectsContext } from "../../../../context-providers";

export const useMonacoFluidAdapter = (
  divElementId: string,
  theme: "vs-dark" | "light"
) => {
  const {
    codeFilesHelperRef,
    codeFilesHelper,
    mappedSandpackFiles: sandpackFiles,
  } = useFluidObjectsContext();
  const monaco = useMonaco();
  const { sandpack } = useSandpack();
  const didConfigureMonacoEditorRef = useRef(false);
  const ignoreModelContentChangesRef = useRef(false);
  // Reference map to check if the textChanged event listener is active
  // for the SharedString instances nested within the codePageMap
  const listeningForRef = useRef<Map<string, boolean>>(new Map());

  const [editor, editorRef, setEditor] = useStateRef<
    Monaco.editor.IStandaloneCodeEditor | undefined
  >(undefined);

  // Support highlighting cursors
  const { onDidInsertText, onDidRemoveText } = useMonacoPresenceCursors(
    editor,
    editorRef
  );

  // Callback to register a listener for changes to SharedText
  const onRegisterCodeFileTextChange = useCallback(
    (key: string, sharedString: SharedString) => {
      if (!editorRef.current || !monaco) return;
      listeningForRef.current.set(key, true);

      sharedString.on("sequenceDelta", (ev: SequenceDeltaEvent) => {
        if (ev.isLocal) {
          return;
        }
        console.log("useMonacoFluidAdapter: incoming changes for SharedString");
        const codeModel = monaco.editor.getModel(
          Monaco.Uri.parse(`file://${key}`)
        );
        if (!codeModel) return;

        try {
          if (key === codeFilesHelperRef.current?.currentKey) {
            // Attempt to merge the ranges
            ignoreModelContentChangesRef.current = true;
          }

          /**
           * Translate the offsets used by the MergeTree into a Range that is
           * interpretable by Monaco.
           * @param offset1 - Starting offset
           * @param offset2 - Ending offset
           */
          const offsetsToRange = (
            offset1: number,
            offset2?: number
          ): Monaco.Range => {
            const pos1 = codeModel.getPositionAt(offset1);
            const pos2 =
              typeof offset2 === "number"
                ? codeModel.getPositionAt(offset2)
                : pos1;
            const range = new monaco.Range(
              pos1.lineNumber,
              pos1.column,
              pos2.lineNumber,
              pos2.column
            );
            return range;
          };

          for (const range of ev.ranges) {
            const segment = range.segment;
            if (TextSegment.is(segment)) {
              switch (range.operation) {
                case MergeTreeDeltaType.INSERT: {
                  const posRange = offsetsToRange(range.position);
                  const text = segment.text || "";
                  if (key === codeFilesHelperRef.current?.currentKey) {
                    editorRef.current!.executeEdits("remote", [
                      { range: posRange, text },
                    ]);
                  } else {
                    codeModel.setValue(sharedString.getText());
                  }
                  onDidInsertText(range.position, segment.text.length, key);
                  break;
                }

                case MergeTreeDeltaType.REMOVE: {
                  const posRange = offsetsToRange(
                    range.position,
                    range.position + segment.text.length
                  );
                  const text = "";
                  if (key === codeFilesHelperRef.current?.currentKey) {
                    editorRef.current!.executeEdits("remote", [
                      { range: posRange, text },
                    ]);
                  } else {
                    codeModel.setValue(sharedString.getText());
                  }
                  onDidRemoveText(
                    range.position,
                    range.position + segment.text.length,
                    key
                  );
                  break;
                }

                default:
                  break;
              }
            }
          }
        } finally {
          ignoreModelContentChangesRef.current = false;
          sandpack.updateFile(key, sharedString.getText());
        }
      });
    },
    [monaco, sandpack, onDidInsertText, onDidRemoveText]
  );

  const onCreateMonacoEditor = useCallback(() => {
    if (!monaco) return;
    didConfigureMonacoEditorRef.current = true;
    // Set up the Monaco editor's compiler and diagnostic options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      allowNonTsExtensions: true,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    });

    // Attach the editor to the <div id="container" />
    const createdEditor = monaco.editor.create(
      document.getElementById(divElementId)!,
      {
        theme,
        automaticLayout: true,
      }
    );
    // Listen for changes to the editor's model
    createdEditor.onDidChangeModelContent((e) => {
      if (
        ignoreModelContentChangesRef.current ||
        !codeFilesHelperRef.current?.currentFile
      ) {
        return;
      }
      const sharedString = codeFilesHelperRef.current.currentFile.value;
      console.log(
        "useMonacoFluidAdapter: posting",
        e.changes.length,
        "changes to SharedString"
      );

      // For each change, modify the SharedString text value
      for (const change of e.changes) {
        if (change.text) {
          if (change.rangeLength === 0) {
            sharedString?.insertText(change.rangeOffset, change.text);
          } else {
            const endPos = change.rangeOffset + change.rangeLength;
            sharedString?.replaceText(change.rangeOffset, endPos, change.text);
            onDidRemoveText(
              change.rangeOffset,
              endPos,
              codeFilesHelperRef.current!.currentFile.key
            );
          }
          onDidInsertText(
            change.rangeOffset,
            change.text.length,
            codeFilesHelperRef.current!.currentFile.key
          );
        } else {
          const endPos = change.rangeOffset + change.rangeLength;
          sharedString?.removeText(change.rangeOffset, endPos);
          onDidRemoveText(
            change.rangeOffset,
            endPos,
            codeFilesHelperRef.current!.currentFile.key
          );
        }
      }

      // Update the corresponding Sandpack file
      sandpack.updateFile(
        codeFilesHelperRef.current.currentKey!,
        createdEditor.getValue()
      );
    });
    // Set the created editor to our local state
    setEditor(createdEditor);

    // For each file in the Sandpack project, create a corresponding
    // model. This includes hidden uneditable files.
    Object.keys(sandpackFiles).forEach((key) => {
      monaco.editor.createModel(
        (sandpackFiles[key] as SandpackFile).code,
        "typescript",
        monaco.Uri.parse(`file://${key}`)
      );
      const sharedString = codeFilesHelperRef.current?.getKeyedFile(key);
      if (sharedString && !listeningForRef.current.get(key)) {
        // Register event listener for incoming changes to the text file
        onRegisterCodeFileTextChange(key, sharedString);
      }
    });

    // TODO: add rest of TS bindings, try to automate as much as possible
    // Load NPM package TypeScript bindings
    MonacoPackageLoader.loadPackages(LiveSharePackages)
      .then((packages) => {
        // For each downloaded package, set them as an extra library within
        // the Monaco TypeScript defaults
        packages.forEach((loadedPackage) => {
          if (loadedPackage.contents) {
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
              loadedPackage.contents,
              `file:///node_modules/${loadedPackage.name}`
            );
          }
        });
      })
      .catch((error) => console.error(error));
  }, [
    monaco,
    sandpackFiles,
    theme,
    divElementId,
    setEditor,
    onRegisterCodeFileTextChange,
    onDidInsertText,
    onDidRemoveText,
  ]);

  const onRefreshMonacoEditor = useCallback(() => {
    if (!monaco || !sandpackFiles || !editor) return;
    // Check to see if any code files have changed/added compared to
    // the ITextModel in our Monaco editor.
    Object.keys(sandpackFiles).forEach((key) => {
      // Attempt to get the model for the key of the file
      const model = monaco.editor.getModel(monaco.Uri.parse(`file://${key}`));
      if (model === null) {
        // Get the initial code value from the Sandpack code file
        const codeValue = (sandpackFiles[key] as SandpackFile).code;
        // Since a model does not yet exist in Monaco, we create a new one
        monaco.editor.createModel(
          codeValue,
          "typescript",
          monaco.Uri.parse(`file://${key}`)
        );
        const sharedString = codeFilesHelper.getKeyedFile(key);
        if (sharedString && !listeningForRef.current.get(key)) {
          // Register event listener for incoming changes to the text file
          onRegisterCodeFileTextChange(key, sharedString);
          sandpack.updateFile(key, codeValue);
        }
      }
    });
  }, [
    sandpackFiles,
    monaco,
    codeFilesHelper,
    sandpack,
    editor,
    onRegisterCodeFileTextChange,
  ]);

  useEffect(() => {
    if (!monaco) return;
    if (!didConfigureMonacoEditorRef.current) {
      // Create a new Monaco editor instance
      onCreateMonacoEditor();
    } else {
      // Refresh the Monaco editor and model listeners if needed
      onRefreshMonacoEditor();
    }
  }, [monaco, onCreateMonacoEditor, onRefreshMonacoEditor]);

  useEffect(() => {
    if (codeFilesHelper && editor) {
      // If the user is viewing a new file, we need to set a listener on the
      // Monaco editor so we can post changes to the `SharedString`
      const checkUriString = `file://${codeFilesHelper.currentKey}`;
      if (editor.getModel()?.uri.toString() !== checkUriString) {
        // Check to see if a model exists for the newly selected file.
        // This code should always run after the previous effect that
        // sets a model when the currentPageKey changes.
        // TODO: validate that this assumption mentioned above is the case
        const model = monaco?.editor.getModel(Monaco.Uri.parse(checkUriString));
        if (model) {
          // We set the newly selected model to the editor so it will become visible
          // to the user.
          editor.setModel(model);
        }
      }
    }
  }, [codeFilesHelper, editor, monaco]);

  useEffect(() => {
    return () => {
      monaco?.editor.getModels().forEach((model) => {
        model.dispose();
        didConfigureMonacoEditorRef.current = false;
      });
    };
  }, [monaco]);
};
