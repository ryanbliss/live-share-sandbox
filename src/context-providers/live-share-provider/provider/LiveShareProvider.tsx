import { FC, ReactNode, useCallback } from "react";
import { LoadableWrapper } from "../../../components/view-wrappers";
import { useTeamsClientContext } from "../../teams-client-provider";
import {
  LiveShareContext,
  useFollowModeState,
  useLiveShareContainer,
  usePresence,
} from "../internals";

export const LiveShareProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { teamsContext } = useTeamsClientContext();
  const liveShareContainer = useLiveShareContainer();

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

  const onChangeSelectedFile = useCallback(
    (fileName: string | undefined) => {
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
    <LiveShareContext.Provider
      value={{
        ...liveShareContainer,
        ...followModeStateData,
        ...presenceData,
        teamsContext,
        onChangeSelectedFile,
      }}
    >
      <LoadableWrapper
        loading={liveShareContainer.loading}
        error={liveShareContainer.error}
      >
        {children}
      </LoadableWrapper>
    </LiveShareContext.Provider>
  );
};
