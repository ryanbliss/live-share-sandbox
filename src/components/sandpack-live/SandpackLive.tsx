import { FC, useMemo } from "react";
import {
  SandpackFiles,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  SandpackThemeProvider,
} from "@codesandbox/sandpack-react";
import * as microsoftTeams from "@microsoft/teams-js";
import { useCodePages } from "../../live-share-hooks/plugins/useCodePages";
import { useFollowModeState } from "../../live-share-hooks/plugins/useFollowModeState";
import { usePresence } from "../../live-share-hooks/plugins/usePresence";
import { SandpackFileExplorer } from "./sandpack-files/SandpackFileExplorer";
import {
  LiveShareSandboxApi,
  WindowMessagingApi,
} from "../../sandpack-templates";
import { FlexColumn, FlexItem } from "../flex";
import { useLiveShareContext } from "../../live-share-hooks/useLiveShare";
import { MonacoEditor } from "./sandpack-editor/MonacoEditor";

interface ISandpackLiveProps {
  template: "react" | "react-ts";
  teamsContext: microsoftTeams.app.Context | undefined;
}

const SandpackLive: FC<ISandpackLiveProps> = (props) => {
  console.log("SandpackLive re-render");
  const { codePagesMap, followModeState, presence, container } =
    useLiveShareContext();

  const { codeFiles, onAddPage } = useCodePages(codePagesMap, container);

  const { followingUserId, onInitiateFollowMode, onEndFollowMode } =
    useFollowModeState(followModeState, props.teamsContext?.user?.id);

  const {
    localUser,
    localUserIsEligiblePresenter,
    currentPageKey,
    onChangeCurrentPageKey,
  } = usePresence(presence, props.teamsContext, "/App.tsx", followingUserId);

  const mappedSandpackFiles = useMemo<SandpackFiles>(() => {
    const _files: SandpackFiles = {};
    codeFiles.forEach((file, key) => {
      _files[key] = {
        code: file.text,
        hidden: false,
        active: key === currentPageKey,
        readOnly: false,
      };
    });
    _files["/LiveShareSandboxApi.ts"] = {
      code: LiveShareSandboxApi,
      hidden: true,
      active: false,
      readOnly: true,
    };
    _files["/WindowMessagingApi.ts"] = {
      code: WindowMessagingApi,
      hidden: true,
      active: false,
      readOnly: true,
    };
    return _files;
  }, [codeFiles, currentPageKey]);

  if (codeFiles.size < 2) {
    return null;
  }

  return (
    <>
      <FlexItem noShrink>
        <SandpackFileExplorer
          codeFiles={codeFiles}
          selectedFileKey={currentPageKey}
          onChangeSelectedFile={(fileName) => {
            onChangeCurrentPageKey(fileName);
            if (
              followingUserId &&
              followingUserId !== localUser?.userId &&
              localUserIsEligiblePresenter
            ) {
              onInitiateFollowMode();
            }
          }}
          followModeActive={!!followingUserId}
          onAddPage={onAddPage}
          onInitiateFollowMode={onInitiateFollowMode}
          onEndFollowMode={onEndFollowMode}
        />
      </FlexItem>
      <FlexColumn expand="fill" style={{ position: "relative" }}>
        <SandpackProvider
          template={props.template}
          files={mappedSandpackFiles}
          customSetup={{
            dependencies: {
              "@microsoft/live-share": "~0.3.1",
              "@microsoft/live-share-media": "~0.3.1",
              "fluid-framework": "~0.59.3000",
              "@fluidframework/test-client-utils": "~0.59.3000",
              "@fluidframework/sequence": "~0.59.3000",
              react: "^18.0.0",
              "react-dom": "^18.0.0",
              "react-scripts": "^4.0.0",
            },
          }}
        >
          <SandpackThemeProvider theme={"dark"}>
            <SandpackLayout>
              <MonacoEditor
                language="typescript"
                theme="vs-dark"
                currentPageKey={currentPageKey}
                editingEnabled={true}
                codeFiles={codeFiles}
                sandpackFiles={mappedSandpackFiles}
              />
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

export default SandpackLive;
