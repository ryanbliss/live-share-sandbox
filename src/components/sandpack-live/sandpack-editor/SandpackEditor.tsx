import {
  FC,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { debounce } from "lodash";
import { SandpackCodeEditor, useSandpack } from "@codesandbox/sandpack-react";
import { CodeMirrorRef } from "@codesandbox/sandpack-react/dist/types/components/CodeEditor/CodeMirror";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { SharedStringHelper } from "@fluid-experimental/react-inputs";
import { useSandpackMessages } from "../../../sandpack-hooks/useSandpackMessages";

interface ISandpackEditorProps {
  pages: Map<string, SharedStringHelper>;
  codePageFiles: Map<string, string>;
  codePageFilesRef: MutableRefObject<Map<string, string>>;
  activeFileRef: MutableRefObject<string | undefined>;
  codemirrorInstance: MutableRefObject<any>;
}

const SandpackEditor: FC<ISandpackEditorProps> = (props) => {
  const {
    pages,
    codePageFiles,
    codePageFilesRef,
    activeFileRef,
    codemirrorInstance,
  } = props;
  const { sandpack } = useSandpack();
  useSandpackMessages();
  const { files, activeFile } = sandpack;

  const activePage = useMemo(() => {
    activeFileRef.current = activeFile;
    return pages.get(activeFile);
  }, [pages, activeFile, activeFileRef]);

  const onPostDocumentChange = useCallback(
    (fromA: number, toA: number, fromB: number, toB: number, inserted: any) => {
      const joiner = inserted.lines > 1 ? `\n` : "";
      const json = inserted.toJSON();
      const text = inserted.toJSON().join(joiner);
      console.log(json[json.length - 1]);
      if (!activePage || activePage?.getText() === text) return;

      if (fromA === toA) {
        console.log("inserting text");
        activePage!.insertText(text, fromA);
      } else if (fromA < toA) {
        if (text.length === 0) {
          console.log("removing text");
          activePage!.removeText(fromA, toA);
        } else {
          console.log("replacing text");
          activePage!.replaceText(text, fromA, toA);
        }
      } else {
        console.log("fromA > toA", fromA, toA);
      }
    },
    [activePage]
  );
  const debouncedPostDocumentChange = useCallback(
    debounce(onPostDocumentChange, 0),
    [onPostDocumentChange, activePage]
  );

  return (
    <SandpackCodeEditor
      ref={codemirrorInstance}
      showTabs={false}
      extensions={[
        EditorView.updateListener.of((v: ViewUpdate) => {
          if (v.docChanged) {
            v.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
              debouncedPostDocumentChange(fromA, toA, fromB, toB, inserted);
            }, false);
          }
        }),
      ]}
      style={{ height: "100vh" }}
    />
  );
};

export default SandpackEditor;
