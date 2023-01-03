import { useCallback, useEffect, useRef, useState } from "react";
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
  recentProjects: IProject[];
  pinnedProjects: IProject[];
  currentProject: IProject | undefined;
  projectTemplates: IProjectTemplate[] | undefined;
  loading: boolean;
  error: Error | undefined;
  postProject: (projectData: IPostProject) => Promise<IProject>;
  setProject: (projectData: ISetProject) => Promise<IProject>;
  deleteProject: (project: IProject) => Promise<void>;
  pinProjectToTeams: (project: IProject, threadId: string) => Promise<void>;
} {
  const params = useParams();
  const clientRef = useRef(new ProjectsService());
  const initializedRef = useRef(false);
  const projectsRef = useRef<Map<string, IProject>>(new Map());
  const [userProjectIds, userProjectIdsRef, setUserProjectIds] = useStateRef<
    string[]
  >([]);
  const [recentProjectIds, recentProjectIdsRef, setRecentProjectIds] =
    useStateRef<string[]>([]);
  const [pinnedProjectIds, pinnedProjectIdsRef, setPinnedProjectIds] =
    useStateRef<string[]>([]);
  const [currentProjectId, currentProjectIdRef, setCurrentProjectId] =
    useStateRef<string | undefined>(undefined);
  const [projectTemplates, setProjectTemplates] = useState<
    IProjectTemplate[] | undefined
  >(undefined);
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
        // setUserProjectIds([
        //   ...userProjectIdsRef.current.filter(
        //     (checkProjectId) => checkProjectId !== project._id
        //   ),
        //   project._id,
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

  const pinProjectToTeams = useCallback(
    async (project: IProject, threadId: string) => {
      try {
        await clientRef.current.postTeamsProjectTeamsThreadPin(
          project._id,
          threadId
        );
        setPinnedProjectIds([project._id, ...pinnedProjectIdsRef.current]);
      } catch (error: any) {
        console.error(error);
      }
    },
    []
  );

  const markProjectAsViewed = useCallback(async (project: IProject) => {
    try {
      await clientRef.current.postProjectView(project._id);
    } catch (error) {
      console.error(error);
      // TODO: display error
    }
    setRecentProjectIds([
      project._id,
      ...recentProjectIdsRef.current.filter(
        (checkProjectId) => checkProjectId !== project._id
      ),
    ]);
  }, []);

  const setProject = useCallback(
    async (projectData: ISetProject): Promise<IProject> => {
      try {
        const project = await clientRef.current.setProject(projectData);
        projectsRef.current.set(project._id, project);
        setUserProjectIds([
          project._id,
          ...userProjectIdsRef.current.filter(
            (checkProjectId) => checkProjectId !== project._id
          ),
        ]);
        const threadId = teamsContext?.chat?.id || teamsContext?.channel?.id;
        if (threadId) {
          try {
            const pinPromise = pinProjectToTeams(project, threadId);
            const viewPromise = markProjectAsViewed(project);
            await Promise.all([pinPromise, viewPromise]);
          } catch (error) {
            console.error(error);
            // TODO: display error
          }
        }
        return project;
      } catch (err: any) {
        if (err instanceof Error) {
          throw err;
        }
        throw new Error("useCodeboxLiveClient: unable to process request");
      }
    },
    [teamsContext, pinProjectToTeams, markProjectAsViewed]
  );

  const deleteProject = useCallback(
    async (project: IProject): Promise<void> => {
      await clientRef.current.deleteProject(project);
      projectsRef.current.delete(project._id);
      if (userProjectIdsRef.current.length > 0) {
        setUserProjectIds([
          ...userProjectIdsRef.current.filter(
            (checkProjectId) => checkProjectId !== project._id
          ),
        ]);
      }
      if (recentProjectIdsRef.current.length > 0) {
        setRecentProjectIds([
          ...recentProjectIdsRef.current.filter(
            (checkProjectId) => checkProjectId !== project._id
          ),
        ]);
      }
      if (pinnedProjectIdsRef.current.length > 0) {
        setPinnedProjectIds([
          ...pinnedProjectIdsRef.current.filter(
            (checkProjectId) => checkProjectId !== project._id
          ),
        ]);
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
        // Get projects created by user
        clientRef.current
          .getUserProjects()
          .then((response) => {
            if (initializedRef.current) {
              const userProjects = [...response.projects];
              userProjects.sort((a, b) => {
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
              userProjects.forEach((userProject) => {
                projectsRef.current.set(userProject._id, userProject);
              });
              setUserProjectIds(
                userProjects.map((userProject) => userProject._id)
              );
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
        // Get recent projects
        clientRef.current
          .getRecentProjects()
          .then((response) => {
            if (initializedRef.current) {
              loadingRef.current = false;
              const recentProjects = [...response.projects];
              recentProjects.forEach((recentProject) => {
                projectsRef.current.set(recentProject._id, recentProject);
              });
              setRecentProjectIds(
                recentProjects.map((recentProject) => recentProject._id)
              );
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
        // If in a chat or channel thread, get pinned projects
        const threadId: string | undefined =
          teamsContext.chat?.id || teamsContext.channel?.id;
        if (threadId) {
          clientRef.current
            .getTeamsPinnedProjects(threadId)
            .then((response) => {
              if (initializedRef.current) {
                const pinnedProjects = [...response.projects];
                pinnedProjects.forEach((pinnedProject) => {
                  projectsRef.current.set(pinnedProject._id, pinnedProject);
                });
                setPinnedProjectIds(
                  pinnedProjects.map((pinnedProject) => pinnedProject._id)
                );
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
        }
        // Get project templates
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
        let currentProject = projectsRef.current.get(projectId);
        if (currentProject) {
          if (currentProject._id !== currentProjectIdRef.current) {
            setCurrentProjectId(projectId);
          }
        } else {
          try {
            currentProject = await clientRef.current.getProject(projectId);
            projectsRef.current.set(projectId, currentProject);
            setCurrentProjectId(projectId);
          } catch (error) {
            console.error(error);
            // TODO: display error
          }
        }
        if (currentProject && currentProject._id !== lastViewIdRef.current) {
          lastViewIdRef.current = projectId;
          try {
            await clientRef.current.postProjectView(projectId);
          } catch (error) {
            console.error(error);
            lastViewIdRef.current = undefined;
            // TODO: display error
          }
          const newRecentProjectIds = [
            projectId,
            ...recentProjectIdsRef.current.filter(
              (checkId) => checkId !== projectId
            ),
          ];
          setRecentProjectIds(newRecentProjectIds);
        }
      };
      refreshCurrentProject();
    }
  }, [params]);

  const userProjects = userProjectIds
    .map((projectId) => projectsRef.current.get(projectId))
    .filter((project) => project !== undefined) as IProject[];
  const recentProjects = recentProjectIds
    .map((projectId) => projectsRef.current.get(projectId))
    .filter((project) => project !== undefined) as IProject[];
  const pinnedProjects = pinnedProjectIds
    .map((projectId) => projectsRef.current.get(projectId))
    .filter((project) => project !== undefined) as IProject[];
  let currentProject: IProject | undefined = currentProjectId
    ? projectsRef.current.get(currentProjectId)
    : undefined;

  return {
    userProjects,
    recentProjects,
    pinnedProjects,
    currentProject,
    projectTemplates,
    // Use ref because it will always be set along with userProjects
    loading: loadingRef.current,
    error,
    postProject,
    setProject,
    deleteProject,
    pinProjectToTeams,
  };
}
