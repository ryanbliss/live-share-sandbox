import { useCallback, useEffect, useRef, useState } from "react";
import { useStateRef } from "../../../../hooks";
import { IPostProject, IProject } from "../../../../models";
import { useTeamsClientContext } from "../../../teams-client-provider";
import { CodeboxClient } from "../client/CodeboxClient";

export function useCodeboxLiveProjects(): {
  userProjects: IProject[];
  loading: boolean;
  error: Error | undefined;
  createOrEditProject: (projectData: IPostProject) => Promise<IProject>;
} {
  const clientRef = useRef(new CodeboxClient());
  const initializedRef = useRef(false);
  const { teamsContext } = useTeamsClientContext();
  const [userProjects, userProjectsRef, setUserProjects] = useStateRef<
    IProject[]
  >([]);
  const loadingRef = useRef(true);
  const [error, setError] = useState<Error>();

  const createOrEditProject = useCallback(
    async (projectData: IPostProject): Promise<IProject> => {
      try {
        const projectResponse = await clientRef.current.postProject(
          projectData
        );
        const project = projectResponse.project;
        setUserProjects([
          ...userProjectsRef.current.filter(
            (checkProject) => checkProject.containerId !== project.containerId
          ),
          project,
        ]);
        return Promise.resolve(projectResponse.project);
      } catch (err: any) {
        if (err instanceof Error) {
          return Promise.reject(err);
        }
        return Promise.reject(
          new Error("useCodeboxLiveClient: unable to process request")
        );
      }
    },
    []
  );

  useEffect(() => {
    if (initializedRef.current || !teamsContext?.user?.id) return;
    initializedRef.current = true;
    clientRef.current
      .authorize(teamsContext.user.id)
      .then(() => {
        clientRef.current
          .getUserProjects()
          .then((response) => {
            if (initializedRef.current) {
              loadingRef.current = false;
              setUserProjects([...response.projects]);
            }
          })
          .catch((err: any) => {
            console.error(err);
            if (err instanceof Error) {
              setError(err);
            } else {
              setError(
                new Error(
                  "useCodeboxLiveProject: an unknown error occurred when getting user projects"
                )
              );
            }
          });
      })
      .catch((err: any) => {
        console.error(err);
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(
            new Error(
              "useCodeboxLiveProject: an unknown error occurred when authorizing user"
            )
          );
        }
      });
    return () => {
      initializedRef.current = false;
    };
  }, [teamsContext]);

  return {
    userProjects,
    // Use ref because it will always be set along with userProjects
    loading: loadingRef.current,
    error,
    createOrEditProject,
  };
}
