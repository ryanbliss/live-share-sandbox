import { SandpackFiles } from "@codesandbox/sandpack-react";
import { FC, useMemo, useRef } from "react";
import {
  useMonacoFluidAdapterHook,
  useSandpackMessages,
} from "../../../../hooks";
import { SharedString } from "fluid-framework";
import { CodeFilesHelper } from "../../../../models";

interface IMonacoEditorProps {
  language: "javascript" | "typescript" | "html" | "css";
  theme: "vs-dark" | "light";
  currentPageKey: string | undefined;
  editingEnabled: boolean;
  codeFiles: Map<string, SharedString>;
  sandpackFiles: SandpackFiles;
}

export const MonacoEditor: FC<IMonacoEditorProps> = (props) => {
  const codeFilesHelperRef = useRef<CodeFilesHelper | undefined>();
  const codeFilesHelper = useMemo(() => {
    codeFilesHelperRef.current = new CodeFilesHelper(
      props.codeFiles,
      props.currentPageKey
    );
    return codeFilesHelperRef.current;
  }, [props.codeFiles, props.currentPageKey]);
  // Set up iFrame window messages for Sandpack
  // This isn't directly related to MonacoEditor but
  // it needs to be in a component within SandpackProvider
  useSandpackMessages();

  // Set up the Monaco editor and apply/post changes
  // to/from SharedString
  useMonacoFluidAdapterHook(
    codeFilesHelper,
    codeFilesHelperRef,
    "container",
    props.sandpackFiles,
    props.theme
  );

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
