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
  const projectsRef = useRef<Map<string, IProject>>(new Map());
  const [userProjectIds, userProjectIdsRef, setUserProjectIds] = useStateRef<
    string[]
  >([]);
  const [recentProjectIds, recentProjectIdsRef, setRecentProjectIds] =
    useStateRef<string[]>([]);
  const [currentProjectId, currentProjectIdRef, setCurrentProjectId] =
    useStateRef<string | undefined>(undefined);
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
      projectsRef.current.delete(project._id);
      setUserProjectIds([
        ...userProjectIdsRef.current.filter(
          (checkProjectId) => checkProjectId !== project._id
        ),
      ]);
      setRecentProjectIds([
        ...recentProjectIdsRef.current.filter(
          (checkProjectId) => checkProjectId !== project._id
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
    .filter((userProject) => userProject !== undefined) as IProject[];
  const recentProjects = recentProjectIds
    .map((projectId) => projectsRef.current.get(projectId))
    .filter((userProject) => userProject !== undefined) as IProject[];
  let currentProject: IProject | undefined = currentProjectId
    ? projectsRef.current.get(currentProjectId)
    : undefined;

  return {
    userProjects,
    recentProjects,
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
