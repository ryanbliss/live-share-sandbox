import { FC, useCallback, useMemo } from "react";
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
  const { codePagesMap, followModeState, presence, container } =
    useLiveShareContext();

  // Get the latest codeFiles map and a callback to create a new page
  const { codeFiles, onAddPage } = useCodePages(codePagesMap, container);

  // Get the current follow state and callbacks to start/end follow mode
  const { followingUserId, onInitiateFollowMode, onEndFollowMode } =
    useFollowModeState(followModeState, props.teamsContext?.user?.id);

  // Use presence to track local user and the page they should be looking at,
  // as well as callback to change their current page.
  const {
    localUser,
    localUserIsEligiblePresenter,
    currentPageKey,
    onChangeCurrentPageKey,
  } = usePresence(presence, props.teamsContext, "/App.tsx", followingUserId);

  // Take the code pages stored in our map and combine with static
  // read-only files that will be hidden from the user.
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

  const onChangeSelectedFile = useCallback(
    (fileName: string) => {
      // Change the file that the user has set as their current file.
      onChangeCurrentPageKey(fileName);

      // If follow mode is active and the user is an eligible presenter
      // but is not in control, take control so that other users are now
      // following them.
      if (
        followingUserId &&
        followingUserId !== localUser?.userId &&
        localUserIsEligiblePresenter
      ) {
        onInitiateFollowMode();
      }
    },
    [
      followingUserId,
      localUser,
      localUserIsEligiblePresenter,
      onChangeCurrentPageKey,
      onInitiateFollowMode,
    ]
  );

  // If we haven't yet loaded the code files, show nothing
  if (codeFiles.size < 2) {
    return null;
  }

  return (
    <>
      <FlexItem noShrink>
        {/* SandpackFileExplorer allows the user to select new files */}
        <SandpackFileExplorer
          codeFiles={codeFiles}
          selectedFileKey={currentPageKey}
          onChangeSelectedFile={onChangeSelectedFile}
          followModeActive={!!followingUserId}
          onAddPage={onAddPage}
          onInitiateFollowMode={onInitiateFollowMode}
          onEndFollowMode={onEndFollowMode}
        />
      </FlexItem>
      <FlexColumn expand="fill" style={{ position: "relative" }}>
        {/* SandpackProvider creates the sandbox and compiles the iFrame with the latest code */}
        <SandpackProvider
          template={props.template}
          files={mappedSandpackFiles}
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
        >
          <SandpackThemeProvider theme={"dark"}>
            <SandpackLayout>
              {/* Custom MonacoEditor for viewing & editing the text of the code */}
              <MonacoEditor
                language="typescript"
                theme="vs-dark"
                currentPageKey={currentPageKey}
                editingEnabled={true}
                codeFiles={codeFiles}
                sandpackFiles={mappedSandpackFiles}
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

export default SandpackLive;
