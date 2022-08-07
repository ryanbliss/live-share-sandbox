import { SandpackFiles } from "@codesandbox/sandpack-react";
import { FC, ReactNode, useCallback, useMemo } from "react";
import { LoadableWrapper } from "../../../components/view-wrappers";
import { useTeamsContext } from "../../../hooks";
import {
  LiveShareSandboxApi,
  WindowMessagingApi,
} from "../../../sandpack-templates";
import {
  FluidObjectsContext,
  useCodePages,
  useFollowModeState,
  useLiveShareContainer,
  usePresence,
} from "../internals";

export const FluidObjectsProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const teamsContext = useTeamsContext();
  const liveShareContainer = useLiveShareContainer();

  // Get the latest codeFiles map and a callback to create a new page
  const codeFilesData = useCodePages(
    liveShareContainer.codePagesMap,
    liveShareContainer.container
  );

  // Get the current follow state and callbacks to start/end follow mode
  const followModeStateData = useFollowModeState(
    liveShareContainer.followModeState,
    teamsContext?.user?.id
  );

  // Use presence to track local user and the page they should be looking at,
  // as well as callback to change their current page.
  const presenceData = usePresence(
    liveShareContainer.presence,
    teamsContext,
    "/App.tsx",
    followModeStateData.followingUserId
  );

  // Take the code pages stored in our map and combine with static
  // read-only files that will be hidden from the user.
  const mappedSandpackFiles = useMemo<SandpackFiles>(() => {
    const _files: SandpackFiles = {};
    codeFilesData.codeFiles.forEach((file, key) => {
      _files[key] = {
        code: file.getText(),
        hidden: false,
        active: key === presenceData.currentPageKey,
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
  }, [codeFilesData.codeFiles, presenceData.currentPageKey]);

  const onChangeSelectedFile = useCallback(
    (fileName: string) => {
      // Change the file that the user has set as their current file.
      presenceData.onChangeCurrentPageKey(fileName);

      // If follow mode is active and the user is an eligible presenter
      // but is not in control, take control so that other users are now
      // following them.
      if (
        followModeStateData.followingUserId &&
        followModeStateData.followingUserId !==
          presenceData.localUser?.userId &&
        presenceData.localUserIsEligiblePresenter
      ) {
        followModeStateData.onInitiateFollowMode();
      }
    },
    [
      followModeStateData.followingUserId,
      presenceData.localUser,
      presenceData.localUserIsEligiblePresenter,
      presenceData.onChangeCurrentPageKey,
      followModeStateData.onInitiateFollowMode,
    ]
  );

  return (
    <FluidObjectsContext.Provider
      value={{
        ...liveShareContainer,
        ...codeFilesData,
        ...followModeStateData,
        ...presenceData,
        teamsContext,
        mappedSandpackFiles,
        onChangeSelectedFile,
      }}
    >
      <LoadableWrapper
        loading={liveShareContainer.loading}
        error={liveShareContainer.error}
      >
        {children}
      </LoadableWrapper>
    </FluidObjectsContext.Provider>
  );
};
