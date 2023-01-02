import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { useStateRef } from "../../../hooks";
import {
  IPostProject,
  IProject,
  IProjectTemplate,
  ISetProject,
} from "../../../models";
import { ProjectsService } from "../../../service";
import { useTeamsClientContext } from "../../teams-client-provider";

export function useCodeboxLiveProjects(): {
  userProjects: IProject[];
  userProjectsRef: MutableRefObject<IProject[]>;
  recentProjects: IProject[];
  recentProjectsRef: MutableRefObject<IProject[]>;
  currentProject: IProject | undefined;
  projectTemplates: IProjectTemplate[] | undefined;
  loading: boolean;
  error: Error | undefined;
  postProject: (projectData: IPostProject) => Promise<IProject>;
  setProject: (projectData: ISetProject) => Promise<IProject>;
  deleteProject: (project: IProject) => Promise<void>;
} {
  const params = useParams();
  const clientRef = useRef(new ProjectsService());
  const initializedRef = useRef(false);
  const [userProjects, userProjectsRef, setUserProjects] = useStateRef<
    IProject[]
  >([]);
  const [recentProjects, recentProjectsRef, setRecentProjects] = useStateRef<
    IProject[]
  >([]);
  const [currentProject, currentProjectRef, setCurrentProject] = useStateRef<
    IProject | undefined
  >(undefined);
  const [projectTemplates, projectTemplatesRef, setProjectTemplates] =
    useStateRef<IProjectTemplate[] | undefined>(undefined);
  const loadingRef = useRef(true);
  const lastViewIdRef = useRef<string>();
  const [error, setError] = useState<Error>();

  const { teamsContext } = useTeamsClientContext();

  const postProject = useCallback(
    async (projectData: IPostProject): Promise<IProject> => {
      try {
        const projectResponse = await clientRef.current.postProject(
          projectData
        );
        // May want to uncomment if use case ever pops up
        // for creating a project without a container
        // const project = projectResponse.project;
        // setUserProjects([
        //   ...userProjectsRef.current.filter(
        //     (checkProject) => checkProject._id !== project._id
        //   ),
        //   project,
        // ]);
        return projectResponse.project;
      } catch (err: any) {
        if (err instanceof Error) {
          throw err;
        }
        throw new Error("useCodeboxLiveClient: unable to process request");
      }
    },
    []
  );

  const setProject = useCallback(
    async (projectData: ISetProject): Promise<IProject> => {
      try {
        const project = await clientRef.current.setProject(projectData);
        setUserProjects([
          project,
          ...userProjectsRef.current.filter(
            (checkProject) => checkProject._id !== project._id
          ),
        ]);
        try {
          await clientRef.current.postProjectView(project._id);
        } catch (error) {
          console.error(error);
          // TODO: display error
        }
        const newRecentProjects = [
          project,
          ...recentProjectsRef.current.filter(
            (checkProject) => checkProject._id !== project._id
          ),
        ];
        setRecentProjects(newRecentProjects);
        return project;
      } catch (err: any) {
        if (err instanceof Error) {
          throw err;
        }
        throw new Error("useCodeboxLiveClient: unable to process request");
      }
    },
    []
  );

  const deleteProject = useCallback(
    async (project: IProject): Promise<void> => {
      await clientRef.current.deleteProject(project);
      setUserProjects([
        ...userProjectsRef.current.filter(
          (checkProject) => checkProject._id !== project._id
        ),
      ]);
      setRecentProjects([
        ...recentProjectsRef.current.filter(
          (checkProject) => checkProject._id !== project._id
        ),
      ]);
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
              const projects = [...response.projects];
              projects.sort((a, b) => {
                const isAfter = moment(a.createdAt).isBefore(b.createdAt);
                if (isAfter) {
                  return 1;
                }
                const isEqual = moment(a.createdAt).isSame(b.createdAt);
                if (isEqual) {
                  return 0;
                }
                return -1;
              });
              setUserProjects(projects);
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
        clientRef.current
          .getRecentProjects()
          .then((response) => {
            if (initializedRef.current) {
              loadingRef.current = false;
              const projects = [...response.projects];
              setRecentProjects(projects);
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
        clientRef.current
          .getTemplates()
          .then((templates) => {
            if (initializedRef.current) {
              setProjectTemplates([...templates]);
            }
          })
          .catch((err: any) => {
            console.error(err);
            if (err instanceof Error) {
              setError(err);
            } else {
              setError(
                new Error(
                  "useCodeboxLiveProject: an unknown error occurred when getting project templates"
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
        let project = userProjectsRef.current.find(
          (checkProject) => checkProject._id === projectId
        );
        if (!project) {
          project = recentProjectsRef.current.find(
            (checkProject) => checkProject._id === projectId
          );
        }
        if (project) {
          if (project._id !== currentProjectRef.current?._id) {
            setCurrentProject(project);
          }
        } else {
          try {
            project = await clientRef.current.getProject(projectId);
            setCurrentProject(project);
          } catch (error) {
            console.error(error);
            // TODO: display error
          }
        }
        if (project && project._id !== lastViewIdRef.current) {
          lastViewIdRef.current = project._id;
          try {
            await clientRef.current.postProjectView(project._id);
          } catch (error) {
            console.error(error);
            lastViewIdRef.current = undefined;
            // TODO: display error
          }
          const newRecentProjects = [
            project,
            ...recentProjectsRef.current.filter(
              (checkProject) => checkProject._id !== projectId
            ),
          ];
          setRecentProjects(newRecentProjects);
        }
      };
      refreshCurrentProject();
    }
  }, [params, userProjects]);

  return {
    userProjects,
    userProjectsRef,
    recentProjects,
    recentProjectsRef,
    currentProject,
    projectTemplates,
    // Use ref because it will always be set along with userProjects
    loading: loadingRef.current,
    error,
    postProject,
    setProject,
    deleteProject,
  };
}
