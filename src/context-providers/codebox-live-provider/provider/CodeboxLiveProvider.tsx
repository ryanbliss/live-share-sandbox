import { FC, ReactNode, useCallback } from "react";
import { IProject, IProjectType } from "../../../models";
import {
  AFRAppTemplate,
  HeaderTemplate,
  LocalAppTemplate,
  TeamsAppTemplate,
} from "../../../sandpack-templates";
import { createAzureContainer, inTeams } from "../../../utils";
import { useTeamsClientContext } from "../../teams-client-provider";
import { CodeboxLiveContext, useCodeboxLiveProjects } from "../internals";

export const CodeboxLiveProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { userProjects, createOrEditProject } = useCodeboxLiveProjects();
  const { teamsContext } = useTeamsClientContext();

  const createProject = useCallback(
    async (template: string): Promise<void> => {
      try {
        console.log("CodeboxLiveProvider: creating from template", template);
        const initialFiles = new Map<string, string>();
        // TODO: replace with real templates
        if (template === "live-share-react-ts") {
          const AppTemplate = inTeams() ? TeamsAppTemplate : LocalAppTemplate;
          initialFiles.set("/App.tsx", AppTemplate);
        } else if (template === "afr-react-ts") {
          const AppTemplate = AFRAppTemplate;
          initialFiles.set("/App.tsx", AppTemplate);
        }
        initialFiles.set("/Header.tsx", HeaderTemplate);
        const results = await createAzureContainer(
          teamsContext!.user!.id,
          initialFiles
        );
        createOrEditProject({
          containerId: results.containerId,
          type: IProjectType.REACT_TS,
          title: template,
        });
        results.container.disconnect?.();
        return Promise.resolve();
      } catch (error: any) {
        return Promise.reject(error);
      }
    },
    [teamsContext, createOrEditProject]
  );

  const editProject = useCallback(
    async (project: IProject): Promise<void> => {
      await createOrEditProject({
        containerId: project.containerId,
        title: project.title,
        type: project.type,
      });
      return Promise.resolve();
    },
    [createOrEditProject]
  );

  return (
    <CodeboxLiveContext.Provider
      value={{
        userProjects,
        createProject,
        editProject,
      }}
    >
      {children}
    </CodeboxLiveContext.Provider>
  );
};
