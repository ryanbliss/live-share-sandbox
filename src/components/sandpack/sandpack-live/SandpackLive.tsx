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
import { useSandpackMessages } from "../../../hooks";

interface ISandpackLiveProps {
  template: "react" | "react-ts";
}

export const SandpackLive: FC<ISandpackLiveProps> = (props) => {
  const { codeFiles, mappedSandpackFiles } = useFluidObjectsContext();
  // Setup Sandpack gateway hub
  useSandpackMessages();

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
              "@codeboxlive/extensions-core": "^0.1.4",
              "@codeboxlive/extensions-fluid": "^0.1.5",
              "@microsoft/live-share": "~0.4.0",
              "@microsoft/live-share-media": "~0.4.0",
              "@microsoft/teams-js": "2.0.0-experimental.1",
              "fluid-framework": "~1.2.3",
              "@fluidframework/azure-client": "~1.0.2",
              "@fluidframework/test-client-utils": "~1.2.3",
              "@fluidframework/sequence": "~1.2.3",
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
