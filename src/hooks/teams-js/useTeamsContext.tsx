import { app, HostClientType, FrameContexts } from "@microsoft/teams-js";
import { useEffect, useState } from "react";
import { inTeams } from "../../utils/inTeams";

export const useTeamsContext = () => {
  const [ctx, setCtx] = useState<app.Context | undefined>();

  useEffect(() => {
    if (!ctx?.user?.id) {
      // Add inTeams=true to URL params to get real Teams context
      if (inTeams()) {
        console.log("useTeamsContext: Attempting to get Teams context");
        // Get Context from the Microsoft Teams SDK
        app
          .getContext()
          .then((context) => {
            console.log(
              `useTeamsContext: received context: ${JSON.stringify(context)}`
            );
            setCtx(context);
          })
          .catch((error) => console.error(error));
      } else {
        // Simulate Teams userObjectId for browser testing
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
            frameContext: FrameContexts.meetingStage,
          },
          user: {
            id: `user${Math.abs(Math.random() * 999999999)}`,
          },
        });
      }
    }
  }, [ctx?.user?.id]);

  return ctx;
};
