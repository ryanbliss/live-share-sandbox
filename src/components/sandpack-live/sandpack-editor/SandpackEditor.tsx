import {
  FC,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { SandpackCodeEditor, useSandpack } from "@codesandbox/sandpack-react";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { SharedStringHelper } from "@fluid-experimental/react-inputs";
import { useSandpackMessages } from "../../../sandpack-hooks/useSandpackMessages";
import { Text } from "@codemirror/state";

interface ISandpackEditorProps {
  pages: Map<string, SharedStringHelper>;
  codePageFiles: Map<string, string>;
  codePageFilesRef: MutableRefObject<Map<string, string>>;
  activeFileRef: MutableRefObject<string | undefined>;
  codemirrorInstance: MutableRefObject<any>;
  editableRef: MutableRefObject<boolean>;
}

const SandpackEditor: FC<ISandpackEditorProps> = (props) => {
  const {
    pages,
    codePageFiles,
    codePageFilesRef,
    activeFileRef,
    codemirrorInstance,
    editableRef,
  } = props;
  const { sandpack } = useSandpack();
  useSandpackMessages();
  const { files, activeFile } = sandpack;

  const activePage = useMemo(() => {
    activeFileRef.current = activeFile;
    return pages.get(activeFile);
  }, [pages, activeFile, activeFileRef]);

  const onPostDocumentChange = useCallback(
    (fromA: number, toA: number, fromB: number, toB: number, inserted: Text) => {
      const text = inserted.sliceString(0, inserted.length, '\n');
      if (!activePage || activePage?.getText() === text) return;
      // if (!editableRef.current) {
      //   const cmInstance = (
      //     codemirrorInstance.current as CodeMirrorRef | undefined
      //   )?.getCodemirror();
      //   if (!cmInstance) {
      //     console.log("cmInstance is undefined");
      //     return;
      //   }

      //   // Current position
      //   const currentPosition = cmInstance.state.selection.ranges[0].to;

      //   console.log(
      //     "cmInstance transaction from 0 to",
      //     cmInstance.state.doc.length
      //   );
      //   // Setting a new position
      //   const trans = cmInstance.state.update({
      //     selection: EditorSelection.cursor(currentPosition),
      //     changes: {
      //       from: 0,
      //       to: cmInstance.state.doc.length,
      //       insert: codePageFilesRef.current!.get(activeFileRef.current!),
      //     },
      //   });

      //   cmInstance.update([trans]);
      //   return;
      // }

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
            console.log(inserted.sliceString(0, inserted.length, '/n'));
            onPostDocumentChange(fromA, toA, fromB, toB, inserted);
          }, false);
        }
      }),
    ]
  }, [onPostDocumentChange]);

  return (
    <SandpackCodeEditor
      ref={codemirrorInstance}
      showTabs={false}
      // readOnly={!editable}
      extensions={extensions}
      style={{ height: "100vh" }}
    />
  );
};

export default SandpackEditor;
