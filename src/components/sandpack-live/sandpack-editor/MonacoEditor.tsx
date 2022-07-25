import { useMonaco } from "@monaco-editor/react";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { SandpackFile, SandpackFiles } from "@codesandbox/sandpack-react";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { ICodeFile } from "../../../models/ICodeFile";
import { useSandpackMessages } from "../../../sandpack-hooks/useSandpackMessages";
import { MonacoPackageLoader } from "../../../loaders/MonacoPackageLoader";
import { LiveSharePackages } from "../../../constants/LiveSharePackages";

interface IMonacoEditorProps {
  language: "javascript" | "typescript" | "html" | "css";
  theme: "vs-dark" | "light";
  currentPageKey: string | undefined;
  editingEnabled: boolean;
  codeFiles: Map<string, ICodeFile>;
  sandpackFiles: SandpackFiles;
}

interface IKeyValueCodeFile {
  key: string;
  value: ICodeFile;
}
type TKeyValueCodeFile = IKeyValueCodeFile | undefined;

export const MonacoEditor: FC<IMonacoEditorProps> = (props) => {
  const didConfigureMonacoEditor = useRef(false);
  const [editor, setEditor] = useState<
    Monaco.editor.IStandaloneCodeEditor | undefined
  >(undefined);
  const monaco = useMonaco();

  // Set up iFrame window messages for Sandpack
  // This isn't directly related to MonacoEditor but
  // it needs to be in a component within SandpackProvider
  useSandpackMessages();

  // Current code file that the user has open
  const currentCodeFile = useMemo<TKeyValueCodeFile>(() => {
    const value: ICodeFile | undefined = props.currentPageKey
      ? props.codeFiles.get(props.currentPageKey!)
      : undefined;
    if (!value) {
      return undefined;
    }
    return {
      key: props.currentPageKey!,
      value,
    };
  }, [props.codeFiles, props.currentPageKey]);

  useEffect(() => {
    if (
      props.currentPageKey &&
      monaco &&
      props.sandpackFiles[props.currentPageKey]
    ) {
      if (!didConfigureMonacoEditor.current) {
        didConfigureMonacoEditor.current = true;
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
        // For each file in the Sandpack project, create a corresponding
        // model. This includes hidden uneditable files.
        Object.keys(props.sandpackFiles).forEach((key) => {
          monaco.editor.createModel(
            (props.sandpackFiles[key] as SandpackFile).code,
            "typescript",
            monaco.Uri.parse(`file://${key}`)
          );
        });

        // Attach the editor to the <div id="container" />
        const createdEditor = monaco.editor.create(
          document.getElementById("container")!,
          {
            theme: props.theme,
            automaticLayout: true,
          }
        );
        // Set the created editor to our local state
        setEditor(createdEditor);
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
      } else {
        // Check to see if any code files have changed/added compared to
        // the ITextModel in our Monaco editor.
        Object.keys(props.sandpackFiles).forEach((key) => {
          // Attempt to get the model for the key of the file
          const model = monaco.editor.getModel(
            monaco.Uri.parse(`file://${key}`)
          );
          // Get the code value from the Sandpack code file
          const codeValue = (props.sandpackFiles[key] as SandpackFile).code;
          if (model !== null) {
            if (model.getValue() !== codeValue) {
              // The Sandpack file has changed and our existing model is out of
              // date, so we update the value.
              console.log("MonacoEditor: setting model value for keys", key);
              // TODO: apply the change as a transform after moving this logic
              // into an adapter to the SharedString
              model.setValue(codeValue);
            }
          } else {
            // Since a model does not yet exist in Monaco, we create a new one
            monaco.editor.createModel(
              codeValue,
              "typescript",
              monaco.Uri.parse(`file://${key}`)
            );
          }
        });
      }
    }
  }, [monaco, props.currentPageKey, props.sandpackFiles, props.theme]);

  useEffect(() => {
    if (currentCodeFile && editor) {
      // If the user is viewing a new file, we need to set a listener on the
      // Monaco editor so we can post changes to the `SharedString`
      const checkUriString = `file://${currentCodeFile.key}`;
      if (editor.getModel()?.uri.toString() !== checkUriString) {
        // Since we know that a model exists for the selected file, we dispose
        // of the old page's model to erase the event listener.
        editor.getModel()!.dispose();
        // Check to see if a model exists for the newly selected file.
        // This code should always run after the previous effect that
        // sets a model when the currentPageKey changes.
        // TODO: validate that this assumption mentioned above is the case
        const model = monaco?.editor.getModel(Monaco.Uri.parse(checkUriString));
        if (model) {
          console.log("MonacoEditor: setting model change listener");
          // We set the newly selected model to the editor so it will become visible
          // to the user.
          editor.setModel(model);
          // Listen for changes to the text of the code file.
          model.onDidChangeContent((event) => {
            console.log("MonacoEditor: text did change");
            const stringHelper = currentCodeFile?.value.stringHelper;
            if (
              stringHelper &&
              currentCodeFile?.value.stringHelper.getText() !== model.getValue()
            ) {
              // Replace the previous text of the code file with the new text.
              // TODO: only replace the exact change that the user types using
              // `event.changes.forEach`. This will require converting IRange into
              // text positions that include the \n eol markers.
              console.log("MonacoEditor: posting change");
              stringHelper.replaceText(
                model.getValue(),
                0,
                stringHelper.getText().length
              );
            }
          });
        }
      }
    }
  }, [currentCodeFile, editor, monaco]);

  // Render the view
  return (
    <div
      style={{
        position: "absolute",
        right: "50%",
        top: 0,
        left: 0,
        bottom: 0,
        height: "100%",
        width: "50%",
      }}
    >
      <div id="container" style={{ width: "100%", height: "100%" }} />
    </div>
  );
};
