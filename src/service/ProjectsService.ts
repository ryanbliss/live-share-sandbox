import axios from "axios";
import {
  IProject,
  IProjectType,
  IUserProjectsResponse,
  IPostProject,
  IPostProjectResponse,
} from "../models";

function isProject(value: any): value is IProject {
  return (
    value &&
    typeof value.containerId === "string" &&
    typeof value.title === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.createdById === "string" &&
    Object.values(IProjectType).includes(value.type)
  );
}

function isPostProjectResponse(value: any): value is IPostProjectResponse {
  return value && isProject(value.project);
}

function isUserProjectsResponse(value: any): value is IUserProjectsResponse {
  if (value === undefined || value === null) return false;
  const projects = value.projects;
  if (projects instanceof Array) {
    if (projects.length === 0) return true;
    return projects
      .map((project: any) => isProject(project))
      .every((isProject) => isProject);
  }
  return false;
}

export class ProjectsService {
  private userId: string | undefined;
  // TODO: real auth
  public async authorize(userId: string): Promise<void> {
    this.userId = userId;
  }
  public async getUserProjects(): Promise<IUserProjectsResponse> {
    if (!this.userId) {
      return Promise.reject(
        new Error(
          "CodeboxService: called getUserProjects before user is authorized"
        )
      );
    }
    const response = await axios.get(
      "https://codebox-live-functions.azurewebsites.net/api/codeboxgetuserprojects?code=-S7slILyBCJK2uvUKJx_NSmOOVADEAStD5RtxHPgMWHwAzFuloV26g%3D%3D",
      {
        headers: {
          Authorization: `Bearer ${this.userId}`,
        },
      }
    );
    const userProjects = response.data.data;
    if (isUserProjectsResponse(userProjects)) {
      return Promise.resolve(userProjects);
    }
    return Promise.reject(
      new Error("CodeboxService: getUserProjects invalid response")
    );
  }
  public async postProject(
    projectData: IPostProject
  ): Promise<IPostProjectResponse> {
    if (!this.userId) {
      return Promise.reject(
        new Error("CodeboxService: called postProject before user is authorized")
      );
    }
    const response = await axios.post(
      "https://codebox-live-functions.azurewebsites.net/api/codeboxpostproject?code=UrTLR-MWHouamPU3PDh-Vck6aQOKonBAL3EbHib3WAUMAzFuhiBIsA%3D%3D",
      projectData,
      {
        headers: {
          Authorization: `Bearer ${this.userId}`,
        },
      }
    );
    const projectResponse = response.data.data;
    if (isPostProjectResponse(projectResponse)) {
      return Promise.resolve(projectResponse);
    }
    return Promise.reject(
      new Error("CodeboxService: postProject invalid response")
    );
  }
}
