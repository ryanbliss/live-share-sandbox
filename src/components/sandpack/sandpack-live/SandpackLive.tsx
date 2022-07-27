import { FC } from "react";
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  SandpackThemeProvider,
} from "@codesandbox/sandpack-react";
import { SandpackFileExplorer } from "./sandpack-files/SandpackFileExplorer";
import { FlexColumn, FlexItem } from "../../flex";
import { MonacoEditor } from "./monaco-editor/MonacoEditor";
import { useFluidObjectsContext } from "../../../context-providers";

interface ISandpackLiveProps {
  template: "react" | "react-ts";
}

export const SandpackLive: FC<ISandpackLiveProps> = (props) => {
  const { codeFiles, mappedSandpackFiles } = useFluidObjectsContext();

  // If we haven't yet loaded the code files, show nothing
  if (codeFiles.size < 2) {
    return null;
  }

  return (
    <>
      <FlexItem noShrink>
        {/* SandpackFileExplorer allows the user to select new files */}
        <SandpackFileExplorer />
      </FlexItem>
      <FlexColumn expand="fill" style={{ position: "relative" }}>
        {/* SandpackProvider creates the sandbox and compiles the iFrame with the latest code */}
        <SandpackProvider
          template={props.template}
          customSetup={{
            dependencies: {
              "@microsoft/live-share": "~0.3.1",
              "@microsoft/live-share-media": "~0.3.1",
              "@microsoft/teams-js": "2.0.0-experimental.0",
              "fluid-framework": "~0.59.3000",
              "@fluidframework/azure-client": "~0.59.3000",
              "@fluidframework/test-client-utils": "~0.59.3000",
              "@fluidframework/sequence": "~0.59.3000",
              react: "^18.0.0",
              "react-dom": "^18.0.0",
              "react-scripts": "^4.0.0",
            },
          }}
          files={mappedSandpackFiles}
        >
          <SandpackThemeProvider theme={"dark"}>
            <SandpackLayout>
              {/* Custom MonacoEditor for viewing & editing the text of the code */}
              <MonacoEditor
                language="typescript"
                theme="vs-dark"
                editingEnabled={true}
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
