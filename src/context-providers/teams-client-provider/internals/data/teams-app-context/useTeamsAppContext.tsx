import {
  teamsDarkTheme,
  teamsHighContrastTheme,
  teamsLightTheme,
  Theme,
} from "@fluentui/react-components";
import { app, HostClientType, FrameContexts } from "@microsoft/teams-js";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { inTeams } from "../../../../../utils";

const LOCAL_STORAGE_KEY = "codebox-live-user-id";

/**
 * @hidden
 * @returns app.Context | undefined and error | undefined
 */
export const useTeamsAppContext = (
  initialized: boolean,
  setTheme: Dispatch<SetStateAction<Theme>>
): {
  teamsContext: app.Context | undefined;
  error: Error | undefined;
} => {
  const [ctx, setCtx] = useState<app.Context | undefined>();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    if (!ctx?.user?.id && initialized) {
      console.log("useTeamsContext: Attempting to get Teams context");
      // Add inTeams=true to URL params to get real Teams context
      if (inTeams()) {
        // Get Context from the Microsoft Teams SDK
        app
          .getContext()
          .then((context) => {
            console.log(
              `useTeamsContext: received context: ${JSON.stringify(context)}`
            );
            switch (context.app.theme) {
              case "dark": {
                // App starts in dark theme
                break;
              }
              case "light": {
                setTheme(teamsLightTheme);
                break;
              }
              case "contrast": {
                setTheme(teamsHighContrastTheme);
                break;
              }
            }
            setCtx(context);
          })
          .catch((error) => setError(error));
      } else {
        // Simulate Teams userObjectId for browser testing
        let userId: string;
        const existingUserId = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (existingUserId) {
          userId = existingUserId;
        } else {
          userId = `user${Math.abs(Math.random() * 999999999)}`;
          localStorage.setItem(LOCAL_STORAGE_KEY, userId);
        }
        // When testing locally, change to light theme as a test case for changing themes from default
        setTheme(teamsLightTheme);
        setCtx({
          app: {
            locale: "us",
            theme: "dark",
            sessionId: "test-session-id",
            host: {
              name: "Orange" as any,
              clientType: HostClientType.web,
              sessionId: "test-session-id",
            },
          },
          page: {
            id: "live-share-sandbox",
            frameContext: FrameContexts.content,
          },
          user: {
            id: userId,
          },
        });
      }
    }
  }, [ctx?.user?.id, initialized]);

  return {
    teamsContext: ctx,
    error,
  };
};
