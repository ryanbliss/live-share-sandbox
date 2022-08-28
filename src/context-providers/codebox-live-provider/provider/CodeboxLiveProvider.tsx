import { FC, ReactNode, useCallback } from "react";
import { IProjectTemplate, ProjectType } from "../../../models";
import { createAzureContainer } from "../../../utils";
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
    postProject,
    setProject,
  } = useCodeboxLiveProjects();
  const { teamsContext } = useTeamsClientContext();

  const createProject = useCallback(
    async (template: IProjectTemplate): Promise<void> => {
      try {
        console.log("CodeboxLiveProvider: creating from template", template);
        // Post initial project to get server-backed project ID
        // TODO: since posting without containerId, need to be able to add
        // container when opening project from list
        const postProjectResponse = await postProject({
          type: ProjectType.REACT_TS,
          title: template.name,
        });
        // Callback function to get initial code files from Git
        async function getInitialFiles(): Promise<Map<string, string>> {
          const provider = await GitFileProvider.create(
            postProjectResponse._id,
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
        // Create Fluid container
        const results = await createAzureContainer(
          teamsContext!.user!.id,
          getInitialFiles
        );
        // Update the newly created project with containerId
        // TODO: need to add retry logic in case this request fails
        await setProject({
          _id: postProjectResponse._id,
          containerId: results.containerId,
        });
        results.container.dispose();
        return Promise.resolve();
      } catch (error: any) {
        return Promise.reject(error);
      }
    },
    [teamsContext, postProject, setProject]
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
        setProject,
      }}
    >
      {children}
    </CodeboxLiveContext.Provider>
  );
};
