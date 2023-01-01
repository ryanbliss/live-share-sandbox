import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LivePresence,
  LivePresenceUser,
  PresenceState,
  UserMeetingRole,
} from "@microsoft/live-share";
import { useStateRef } from "../../../../hooks";
import * as microsoftTeams from "@microsoft/teams-js";
import { IPresenceContext, IUser, ICursor } from "../../../../models";

export const usePresence = (
  presence: LivePresence | undefined,
  context: microsoftTeams.app.Context | undefined,
  initialPageKey: string,
  followingUserId: string | undefined
): IPresenceContext => {
  const [otherUsers, setOtherUsers] = useState<IUser[]>([]);
  const [localUser, localUserRef, setLocalUser] = useStateRef<
    IUser | undefined
  >(undefined);
  const [started, setStarted] = useState(false);

  const users = useMemo(() => {
    if (localUser) {
      return [localUser, ...otherUsers];
    }
    return [...otherUsers];
  }, [localUser, otherUsers]);

  const localUserIsEligiblePresenter = useMemo(() => {
    if (
      localUser?.roles?.includes(UserMeetingRole.organizer) ||
      localUser?.roles?.includes(UserMeetingRole.presenter)
    ) {
      return true;
    }
    return false;
  }, [localUser]);

  // The page that the local user should be looking at
  const currentPageKey = useMemo(() => {
    if (followingUserId) {
      // Follow mode is active, so return the page the leading user is looking at
      return (
        users.find((user) => user.userId === followingUserId)?.currentPageKey ??
        initialPageKey
      );
    }
    // Return the local user's page, or if unknown, the initial page (e.g., App.tsx)
    return localUser?.currentPageKey ?? initialPageKey;
  }, [
    followingUserId,
    initialPageKey,
    users,
    localUserIsEligiblePresenter,
    localUser,
  ]);

  // Post user presence with and the page they are currently looking at
  const updatePresence = useCallback(
    (name?: string, currentPageKey?: string, cursor?: ICursor) => {
      presence?.updatePresence(PresenceState.online, {
        name: name ?? localUserRef.current?.name,
        currentPageKey: currentPageKey ?? localUserRef.current?.currentPageKey,
        cursor: cursor ?? localUserRef.current?.cursor,
      });
    },
    [presence]
  );

  // Callback exposed to UI to change the current page the user is looking at
  const onChangeCurrentPageKey = useCallback(
    (currentPageKey: string | undefined) => {
      // If user has a cursor, reset selection when changing page
      const newCursor = localUserRef.current?.cursor
        ? Object.assign({}, localUserRef.current!.cursor!)
        : undefined;
      if (newCursor) {
        newCursor.selection = undefined;
      }
      updatePresence(undefined, currentPageKey, newCursor);
    },
    [updatePresence]
  );

  // Callback exposed to UI to change the current page the user is looking at
  const onChangeCursor = useCallback(
    (cursor: ICursor) => {
      updatePresence(undefined, undefined, cursor);
    },
    [updatePresence]
  );

  // Effect which registers SharedPresence event listeners before joining space
  useEffect(() => {
    if (!presence || presence.isInitialized || !context || !initialPageKey)
      return;
    console.info("usePresence: starting presence");
    const onPresenceChanged = (
      userPresence: LivePresenceUser,
      local: boolean
    ) => {
      if (local) {
        // We update local user separately so that we can
        // get their Teams meeting role.
        const userData = userPresence.data as any;
        const localUser: IUser = {
          userId: userPresence.userId,
          state: userPresence.state,
          name: userData?.name ? `${userData.name}` : "Unknown",
          isLocal: local,
          currentPageKey: userData?.currentPageKey
            ? `${userData.currentPageKey}`
            : undefined,
          cursor: userData?.cursor,
          roles: [],
        };
        // Get the roles of the local user
        userPresence
          .getRoles()
          .then((roles) => {
            localUser.roles = roles;
            // Set local user state
            setLocalUser(localUser);
          })
          .catch((err) => {
            console.error(err);
            setLocalUser(localUser);
          });
      } else {
        // Update our local state for our list of users
        const updatedUsers: IUser[] = presence
          .toArray()
          .map((userPresence) => {
            const userData = userPresence.data as any;
            return {
              userId: userPresence.userId,
              state: userPresence.state,
              name: userData?.name ? `${userData.name}` : "Unknown",
              currentPageKey: userData?.currentPageKey
                ? `${userData.currentPageKey}`
                : undefined,
              cursor: userData?.cursor,
              isLocal: userPresence.userId === localUserRef.current?.userId,
            };
          })
          .filter((user) => user.state === PresenceState.online);
        setOtherUsers(updatedUsers);
      }
    };
    // Set the presenceChange event listener, which updates when any
    // user's presence is updated.
    presence.on("presenceChanged", onPresenceChanged);
    // displayName may not be known in all M365 hubs right now
    // so we use their email handle instead if needed.
    const userPrincipalName =
      context?.user?.displayName ??
      context?.user?.userPrincipalName ??
      `unknown@contoso.com`;
    const name = userPrincipalName.split("@")[0];

    // Start listening for presence changes
    presence
      .initialize(context?.user?.id, {
        name,
        currentPageKey: initialPageKey,
      })
      .then(() => {
        setStarted(true);
      })
      .catch((error) => console.error(error));
    return () => {
      console.log("presence off");
      presence.off("presenceChanged", onPresenceChanged);
    };
  }, [presence, context]);

  return {
    presenceStarted: started,
    localUser,
    localUserRef,
    localUserIsEligiblePresenter,
    users,
    otherUsers,
    currentPageKey,
    onChangeCurrentPageKey,
    onChangeCursor,
  };
};
