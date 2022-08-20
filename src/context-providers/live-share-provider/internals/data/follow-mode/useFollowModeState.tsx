import { EphemeralState, UserMeetingRole } from "@microsoft/live-share";
import { useCallback, useEffect, useState } from "react";
import {
  IFollowModeStateContext,
  IFollowModeStateValue,
} from "../../../../../models";
import { useStateRef } from "../../../../../hooks";

// Follow mode allows a user to force other users to move to the page that they
// are looking at. Only meeting presenters and organizers have the privilege
// to start and end this mode.
export function useFollowModeState(
  followModeState: EphemeralState<IFollowModeStateValue> | undefined,
  localUserId?: string,
  presentingUserId?: string
): IFollowModeStateContext {
  const [followingUserId, followingUserIdRef, setFollowingUserId] = useStateRef<
    string | undefined
  >(presentingUserId);
  const [started, setStarted] = useState(false);

  const onInitiateFollowMode = useCallback(() => {
    if (localUserId === followingUserIdRef.current) {
      return;
    }
    followModeState?.changeState("follow", {
      userId: localUserId,
    });
  }, [localUserId, followModeState]);

  const onEndFollowMode = useCallback(() => {
    if (!followingUserIdRef.current) {
      return;
    }
    followModeState?.changeState("free", {});
  }, [followModeState]);

  useEffect(() => {
    if (!followModeState || followModeState.isStarted) return;
    const onStateChanged = (
      state: string,
      value: IFollowModeStateValue | undefined
    ) => {
      if (["follow", "free"].includes(state)) {
        if (value?.userId) {
          setFollowingUserId(value.userId!);
        } else {
          setFollowingUserId(undefined);
        }
      }
    };
    console.log("useFollowModeState: listening to state changes");
    followModeState.on("stateChanged", onStateChanged);
    const allowedRoles: UserMeetingRole[] = [
      UserMeetingRole.organizer,
      UserMeetingRole.presenter,
    ];
    followModeState
      .start(allowedRoles)
      .then(() => {
        setStarted(true);
      })
      .catch((error) => console.error(error));
    return () => {
      followModeState.off("stateChanged", onStateChanged);
    };
  }, [followModeState, setStarted, setFollowingUserId]);

  return {
    followModeStateStarted: started,
    followingUserId,
    onInitiateFollowMode,
    onEndFollowMode,
  };
}
