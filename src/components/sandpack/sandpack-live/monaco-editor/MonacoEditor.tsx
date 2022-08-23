import { FC, useEffect } from "react";
import { useMonacoFluidAdapterHook } from "../../../../hooks";

interface IMonacoEditorProps {
  language: "javascript" | "typescript" | "html" | "css";
  theme: "vs-dark" | "light";
  editingEnabled: boolean;
}

export const MonacoEditor: FC<IMonacoEditorProps> = (props) => {
  // Set up the Monaco editor and apply/post changes
  // to/from SharedString
  useMonacoFluidAdapterHook("container", props.theme);

  useEffect(() => {
    return () => {
      console.log("unmount MonacoEditor");
    };
  }, []);

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
