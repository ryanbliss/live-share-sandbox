import { app } from "@microsoft/teams-js";
import { v4 as uuid } from "uuid";
import { AppConfig } from "../constants";
import { inTeams } from "./inTeams";

const USE_MEET_NOW_ENABLED = true;

export const shareToMeetingViaDeepLink = async (
  appSharingUrl: string
): Promise<void> => {
  const appContext = JSON.stringify({
    appSharingUrl,
    appId: AppConfig.teamsAppId,
    useMeetNow: USE_MEET_NOW_ENABLED,
  });
  const encodedContext = encodeURIComponent(appContext)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  const encodedAppContext = encodeURIComponent(encodedContext)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  const url = `https://teams.microsoft.com/l/meeting-share?deeplinkId=${uuid()}&lm=deeplink%22&appContext=${encodedAppContext}`;
  if (inTeams()) {
    try {
      await app.openLink(url);
    } catch (error: any) {
      throw error;
    }
  } else {
    window.open(url, "_blank");
  }
};
