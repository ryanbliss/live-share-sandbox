import {
  Dispatch,
  FC,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  SandpackCodeEditor,
  SandpackFiles,
  useActiveCode,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { SharedStringHelper } from "@fluid-experimental/react-inputs";
import { useSandpackMessages } from "../../../sandpack-hooks/useSandpackMessages";
import { EditorSelection, Text } from "@codemirror/state";
import { CodeMirrorRef } from "@codesandbox/sandpack-react/dist/types/components/CodeEditor/CodeMirror";
import { debounce } from "lodash";

interface ISandpackEditorProps {
  pages: Map<string, SharedStringHelper>;
  codePageFiles: Map<string, string>;
  sandpackFiles: SandpackFiles;
  activeFileRef: MutableRefObject<string | undefined>;
  codemirrorInstance: MutableRefObject<any>;
  editableRef: MutableRefObject<boolean>;
  setSandpackFiles: Dispatch<SetStateAction<SandpackFiles>>;
}

const SandpackEditor: FC<ISandpackEditorProps> = (props) => {
  const {
    pages,
    codePageFiles,
    sandpackFiles,
    activeFileRef,
    codemirrorInstance,
    editableRef,
    setSandpackFiles,
  } = props;
  const { sandpack } = useSandpack();
  const { updateCode } = useActiveCode();
  useSandpackMessages();
  const { activeFile } = sandpack;

  const activePage = useMemo(() => {
    activeFileRef.current = activeFile;
    return pages.get(activeFile);
  }, [pages, activeFile, activeFileRef]);

  const onPostDocumentChange = useCallback(
    (
      fromA: number,
      toA: number,
      fromB: number,
      toB: number,
      inserted: Text
    ) => {
      const text = inserted.sliceString(0, inserted.length, "\n");
      if (!activePage || activePage?.getText() === text) return;

      if (fromA === toA) {
        console.log("inserting text", text);
        activePage!.insertText(text, fromA);
      } else if (fromA < toA) {
        if (text.length === 0) {
          console.log("removing text");
          activePage!.removeText(fromA, toA);
        } else {
          console.log("replacing text", text);
          activePage!.replaceText(text, fromA, toA);
        }
      } else {
        console.log("fromA > toA", fromA, toA);
      }
    },
    [activePage, editableRef]
  );

  const extensions = useMemo(() => {
    return [
      EditorView.updateListener.of((v: ViewUpdate) => {
        if (v.docChanged) {
          console.log("EditorView.updateListener: docChanged");
          v.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
            onPostDocumentChange(fromA, toA, fromB, toB, inserted);
          }, false);
        }
      }),
    ];
  }, [onPostDocumentChange]);

  const applyCurrentDocumentChange = useCallback(() => {
    if (!activePage) return;
    updateCode(activePage!.getText());
  }, [activePage, updateCode]);

  // TODO: this is probably fragile, since if 2+ people edit simultaneously
  // then there are likely to be conflicts with this. Need to think this through
  // better.
  const debouncedApplyCurrentDocumentChange = useCallback(
    debounce(applyCurrentDocumentChange, 100),
    [applyCurrentDocumentChange, activePage]
  );

  const onApplyTemplateChange = useCallback(() => {
    const _files: SandpackFiles = {};
    let valueChanged = false;
    codePageFiles.forEach((value, key) => {
      _files[key] = value;
      if (sandpackFiles[key] !== value) {
        console.log(
          "template changed",
          key,
          "current page",
          activeFileRef.current
        );
        if (sandpackFiles[key] && key === activeFileRef.current) {
          // Getting CodeMirror instance
          const cmInstance = (
            codemirrorInstance.current as CodeMirrorRef | undefined
          )?.getCodemirror();
          if (!cmInstance) {
            console.log("cmInstance is undefined");
            return;
          }

          try {
            // Current position
            const currentPosition = cmInstance.state.selection.ranges[0].to;

            console.log(
              "cmInstance transaction from 0 to",
              cmInstance.state.doc.length
            );
            // Setting a new position
            const trans = cmInstance.state.update({
              selection: EditorSelection.cursor(currentPosition + 1),
              changes: {
                from: 0,
                to: cmInstance.state.doc.length,
                insert: value,
              },
            });

            cmInstance.update([trans]);
            debouncedApplyCurrentDocumentChange();
          } catch {
            (error: Error) => {
              console.error(error);
            };
          }
        } else {
          valueChanged = true;
        }
      }
    });
    if (valueChanged) {
      console.log("setting sandpack files");
      setSandpackFiles(_files);
    }
  }, [
    codePageFiles,
    sandpackFiles,
    setSandpackFiles,
    debouncedApplyCurrentDocumentChange,
  ]);

  useEffect(() => {
    if (codePageFiles.size > 1) {
      onApplyTemplateChange();
    }
  }, [onApplyTemplateChange, codePageFiles]);

  return (
    <SandpackCodeEditor
      ref={codemirrorInstance}
      showTabs={false}
      // readOnly={!editable}
      extensions={extensions}
      style={{
        position: "absolute",
        right: "50%",
        top: 0,
        left: 0,
        bottom: 0,
        height: "100%",
        width: "50%",
      }}
    />
  );
};

export default SandpackEditor;
