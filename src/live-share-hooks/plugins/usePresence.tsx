import { useState, useEffect, useCallback, useMemo } from "react";
import {
  EphemeralPresence,
  PresenceState,
  UserMeetingRole,
} from "@microsoft/live-share";
import { useStateRef } from "../../utils/useStateRef";
import * as microsoftTeams from "@microsoft/teams-js";
import { IUser } from "../../models/IUser";

export const usePresence = (
  presence: EphemeralPresence | undefined,
  context: microsoftTeams.app.Context | undefined,
  initialPageKey: string,
  followingUserId: string | undefined
): {
  presenceStarted: boolean;
  localUser: IUser | undefined;
  localUserIsEligiblePresenter: boolean;
  users: IUser[];
  currentPageKey: string;
  onChangeCurrentPageKey: (currentPageKey: string) => void;
} => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [localUser, localUserRef, setLocalUser] = useStateRef<
    IUser | undefined
  >(undefined);
  const [started, setStarted] = useState(false);

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
    ({ name = "", currentPageKey = "" }) => {
      presence?.updatePresence(PresenceState.online, {
        name: name ?? localUserRef.current?.name,
        currentPageKey: currentPageKey ?? localUserRef.current?.currentPageKey,
      });
    },
    [presence, localUserRef]
  );

  // Callback exposed to UI to change the current page the user is looking at
  const onChangeCurrentPageKey = useCallback(
    (currentPageKey: string) => {
      updatePresence({ currentPageKey });
    },
    [updatePresence]
  );

  // Effect which registers SharedPresence event listeners before joining space
  useEffect(() => {
    if (presence && !presence.isStarted && context && initialPageKey) {
      console.info("usePresence: starting presence");
      // Set the presenceChange event listener, which updates when any
      // user's presence is updated.
      presence.on("presenceChanged", (userPresence, local) => {
        if (local) {
          // We update local user separately so that we can
          // get their Teams meeting role.
          const userData = userPresence.data as any;
          const localUser: IUser = {
            userId: userPresence.userId,
            state: userPresence.state,
            name: userData?.name ? `${userData.name}` : "Unknown",
            currentPageKey: userData?.currentPageKey
              ? `${userData.currentPageKey}`
              : undefined,
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
        }
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
            } as IUser;
          })
          .filter((user) => user.state === PresenceState.online);
        setUsers(updatedUsers);
      });
      // displayName may not be known in all M365 hubs right now
      // so we use their email handle instead if needed.
      const userPrincipalName =
        context?.user?.displayName ??
        context?.user?.userPrincipalName ??
        `unknown@contoso.com`;
      const name = userPrincipalName.split("@")[0];

      // Start listening for presence changes
      presence
        .start(context?.user?.id, {
          name,
          currentPageKey: initialPageKey,
        })
        .then(() => {
          setStarted(true);
        })
        .catch((error) => console.error(error));
    }
  }, [presence, context, setStarted, setLocalUser]);

  return {
    presenceStarted: started,
    localUser,
    localUserIsEligiblePresenter,
    users,
    currentPageKey,
    onChangeCurrentPageKey,
  };
};
