import { FC, useMemo, useRef } from "react";
import {
  useMonacoFluidAdapterHook,
  useSandpackMessages,
} from "../../../../hooks";
import { CodeFilesHelper } from "../../../../models";
import { useFluidObjectsContext } from "../../../../context-providers";

interface IMonacoEditorProps {
  language: "javascript" | "typescript" | "html" | "css";
  theme: "vs-dark" | "light";
  editingEnabled: boolean;
}

export const MonacoEditor: FC<IMonacoEditorProps> = (props) => {
  const { codeFiles, currentPageKey, mappedSandpackFiles } =
    useFluidObjectsContext();

  const codeFilesHelperRef = useRef<CodeFilesHelper | undefined>();
  const codeFilesHelper = useMemo(() => {
    codeFilesHelperRef.current = new CodeFilesHelper(codeFiles, currentPageKey);
    return codeFilesHelperRef.current;
  }, [codeFiles, currentPageKey]);

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
    mappedSandpackFiles,
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
