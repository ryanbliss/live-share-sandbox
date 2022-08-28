import { FC, ReactNode, useCallback } from "react";
import { IProject, IProjectTemplate, ProjectType } from "../../../models";
import { createAzureContainer, inTeams } from "../../../utils";
import { GitFileProvider } from "../../../utils/GitFileProvider";
import { useTeamsClientContext } from "../../teams-client-provider";
import { CodeboxLiveContext, useCodeboxLiveProjects } from "../internals";

export const CodeboxLiveProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const {
    userProjects,
    userProjectsRef,
    currentProject,
    projectTemplates,
    loading,
    error,
    createOrEditProject,
  } = useCodeboxLiveProjects();
  const { teamsContext } = useTeamsClientContext();

  const createProject = useCallback(
    async (template: IProjectTemplate): Promise<void> => {
      try {
        console.log("CodeboxLiveProvider: creating from template", template);
        async function getInitialFiles(
          containerId: string
        ): Promise<Map<string, string>> {
          const provider = await GitFileProvider.create(
            containerId,
            template.repository.toString(),
            template.branch
          );
          const files = await provider.getAllFiles();
          const filesMap = new Map<string, string>();
          files.forEach((file) => {
            const filePath = file.path.split("./").join("/");
            filesMap.set(filePath, file.content);
          });
          return filesMap;
        }
        const results = await createAzureContainer(
          teamsContext!.user!.id,
          getInitialFiles
        );
        await createOrEditProject({
          containerId: results.containerId,
          type: ProjectType.REACT_TS,
          title: template.name,
        });
        results.container.dispose();
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
        projectTemplates,
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
