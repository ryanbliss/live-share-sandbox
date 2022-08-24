import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { useStateRef } from "../../../../hooks";
import { IPostProject, IProject } from "../../../../models";
import { ProjectsService } from "../../../../service";
import { useTeamsClientContext } from "../../../teams-client-provider";

export function useCodeboxLiveProjects(): {
  userProjects: IProject[];
  userProjectsRef: MutableRefObject<IProject[]>;
  currentProject: IProject | undefined;
  loading: boolean;
  error: Error | undefined;
  createOrEditProject: (projectData: IPostProject) => Promise<IProject>;
} {
  const params = useParams();
  const clientRef = useRef(new ProjectsService());
  const initializedRef = useRef(false);
  const [userProjects, userProjectsRef, setUserProjects] = useStateRef<
    IProject[]
  >([]);
  const [currentProject, currentProjectRef, setCurrentProject] = useStateRef<
    IProject | undefined
  >(undefined);
  const loadingRef = useRef(true);
  const [error, setError] = useState<Error>();

  const { teamsContext } = useTeamsClientContext();

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

  useEffect(() => {
    const projectId = params["projectId"];
    if (projectId) {
      const refreshCurrentProject = async () => {
        const project = userProjectsRef.current.find(
          (project) => project._id === projectId
        );
        if (project) {
          if (project._id !== currentProjectRef.current?._id) {
            setCurrentProject(project);
          }
        } else {
          try {
            const newProject = await clientRef.current.getProject(projectId);
            setCurrentProject(newProject);
          } catch (error) {
            console.error(error);
          }
        }
      };
      refreshCurrentProject();
    }
  }, [params, userProjects]);

  return {
    userProjects,
    userProjectsRef,
    currentProject,
    // Use ref because it will always be set along with userProjects
    loading: loadingRef.current,
    error,
    createOrEditProject,
  };
}
