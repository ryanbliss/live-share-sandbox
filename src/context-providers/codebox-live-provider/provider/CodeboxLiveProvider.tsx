import { FC, ReactNode, useCallback } from "react";
import { IProject, IProjectType } from "../../../models";
import {
  AFRAppTemplate,
  HeaderTemplate,
  LocalAppTemplate,
  ReactTSAppTemplate,
  LiveShareAppTemplate,
  TeamsAppTemplate,
} from "../../../sandpack-templates";
import { createAzureContainer, inTeams } from "../../../utils";
import { useTeamsClientContext } from "../../teams-client-provider";
import { CodeboxLiveContext, useCodeboxLiveProjects } from "../internals";

export const CodeboxLiveProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const {
    userProjects,
    userProjectsRef,
    currentProject,
    loading,
    error,
    createOrEditProject,
  } = useCodeboxLiveProjects();
  const { teamsContext } = useTeamsClientContext();

  const createProject = useCallback(
    async (template: string): Promise<void> => {
      try {
        console.log("CodeboxLiveProvider: creating from template", template);
        const initialFiles = new Map<string, string>();
        // TODO: replace with real templates
        let AppTemplate: string;
        if (template === "live-share-react-ts") {
          AppTemplate = inTeams() ? LiveShareAppTemplate : LocalAppTemplate;
        } else if (template === "afr-react-ts") {
          AppTemplate = AFRAppTemplate;
        } else if (template === "react-ts") {
          AppTemplate = ReactTSAppTemplate;
        } else if ("teams-react-ts") {
          AppTemplate = TeamsAppTemplate;
        } else {
          return Promise.reject(
            `CodeboxLiveProvider createProject: ${template} is not a valid template type`
          );
        }
        initialFiles.set("/App.tsx", AppTemplate);
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
        results.container.dispose?.();
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
        userProjectsRef,
        currentProject,
        loading,
        error,
        createProject,
        editProject,
      }}
    >
      {children}
    </CodeboxLiveContext.Provider>
  );
};
