import { FC } from "react";
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  SandpackThemeProvider,
} from "@codesandbox/sandpack-react";
import { FileExplorer } from "./file-explorer/FileExplorer";
import { FlexColumn, FlexItem } from "../flex";
import { MonacoEditor } from "./monaco-editor/MonacoEditor";
import { useFluidObjectsContext } from "../../context-providers";
import { useSandpackMessages } from "../../hooks";
import { useCodeboxLiveProjects } from "../../context-providers/codebox-live-provider/internals";
import { LanguageType } from "../../models";

export const CodeProject: FC = () => {
  const { codeFiles, mappedSandpackFiles } = useFluidObjectsContext();
  const { currentProject } = useCodeboxLiveProjects();
  // Setup Sandpack gateway hub
  useSandpackMessages();

  // If we haven't yet loaded the code files, show nothing
  if (codeFiles.size < 2 || !currentProject) {
    return null;
  }

  return (
    <>
      <FlexItem noShrink>
        {/* SandpackFileExplorer allows the user to select new files */}
        <FileExplorer />
      </FlexItem>
      <FlexColumn expand="fill" style={{ position: "relative" }}>
        {/* SandpackProvider creates the sandbox and compiles the iFrame with the latest code */}
        <SandpackProvider files={mappedSandpackFiles}>
          <SandpackThemeProvider theme={"dark"}>
            <SandpackLayout>
              {/* Custom MonacoEditor for viewing & editing the text of the code */}
              <MonacoEditor
                language={
                  currentProject.language === LanguageType.typescript
                    ? "typescript"
                    : "javascript"
                }
                theme="vs-dark"
                editingEnabled={true}
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
              {/* Preview viewer for the compiled application */}
              <SandpackPreview
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  height: "100%",
                  width: "50%",
                }}
              />
            </SandpackLayout>
          </SandpackThemeProvider>
        </SandpackProvider>
      </FlexColumn>
    </>
  );
};
