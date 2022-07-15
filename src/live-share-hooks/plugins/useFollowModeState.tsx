import { EphemeralState, UserMeetingRole } from "@microsoft/live-share";
import { useCallback, useEffect, useState } from "react";
import { useStateRef } from "../../utils/useStateRef";

export interface IFollowModeStateValue {
  userId?: string;
}

export function useFollowModeState(
  followModeState: EphemeralState<IFollowModeStateValue> | undefined,
  localUserId?: string,
  presentingUserId?: string
): {
  followModeStateStarted: boolean;
  followingUserId?: string;
  onInitiateFollowMode: () => void;
  onEndFollowMode: () => void;
} {
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
    if (followModeState && !followModeState.isStarted) {
      console.log("usePokerState: starting poker state");
      followModeState.on("stateChanged", (state, value) => {
        if (["follow", "free"].includes(state)) {
          if (value?.userId) {
            setFollowingUserId(value.userId!);
          } else {
            setFollowingUserId(undefined);
          }
        }
      });
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
    }
  }, [followModeState, setStarted, setFollowingUserId]);

  return {
    followModeStateStarted: started,
    followingUserId,
    onInitiateFollowMode,
    onEndFollowMode,
  };
}
