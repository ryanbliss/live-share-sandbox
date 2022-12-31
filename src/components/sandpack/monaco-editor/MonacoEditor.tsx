import { CSSProperties, FC, useEffect } from "react";
import { useMonacoFluidAdapter } from "./adapter";

interface IMonacoEditorProps {
  language: "javascript" | "typescript" | "html" | "css";
  theme: "vs-dark" | "light";
  editingEnabled: boolean;
  style?: CSSProperties;
}

export const MonacoEditor: FC<IMonacoEditorProps> = (props) => {
  // Set up the Monaco editor and apply/post changes
  // to/from SharedString
  useMonacoFluidAdapter("container", props.theme);

  useEffect(() => {
    return () => {
      console.log("unmount MonacoEditor");
    };
  }, []);

  // Render the view
  return (
    <div style={props.style}>
      <div id="container" style={{ width: "100%", height: "100%" }} />
    </div>
  );
};
