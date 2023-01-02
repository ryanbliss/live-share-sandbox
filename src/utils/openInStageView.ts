import { app, FrameContexts, stageView } from "@microsoft/teams-js";
import { AppConfig } from "../constants";
import { IProject } from "../models";
import { inTeams } from "./inTeams";

export const openInStageView = async (
  project: IProject,
  teamsContext: app.Context | undefined
): Promise<void> => {
  const websiteUrl = `${window.location.origin}/projects/${project._id}`;
  const contentUrl = `${websiteUrl}?inTeams=${inTeams()}`;
  try {
    if (
      inTeams() &&
      teamsContext?.page.frameContext === FrameContexts.content
    ) {
      await stageView.open({
        appId: AppConfig.teamsAppId,
        contentUrl,
        threadId: teamsContext.chat?.id || teamsContext.channel?.id || "",
        title: project.title,
        websiteUrl: websiteUrl,
      });
    } else {
      window.open(websiteUrl);
    }
  } catch (error: any) {
    throw error;
  }
};
