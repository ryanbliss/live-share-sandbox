import axios from "axios";
import {
  IProject,
  ProjectType,
  IUserProjectsResponse,
  IPostProject,
  IPostProjectResponse,
  ISetProject,
} from "../models";

function isProject(value: any): value is IProject {
  return (
    value &&
    (typeof value.containerId === "string" ||
      value.containerId === undefined) &&
    typeof value.title === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.createdById === "string" &&
    Object.values(ProjectType).includes(value.type)
  );
}

function isProjectResponse(value: any): value is IPostProjectResponse {
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
      "https://codebox-live-functions-west-us.azurewebsites.net/api/codeboxgetuserprojects?code=slwrGp0Ch8dtV_35spI8YzeCKQKkm9HwZf3ANFdCii74AzFuFBn1Ew%3D%3D",
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
        new Error(
          "CodeboxService: called postProject before user is authorized"
        )
      );
    }
    const response = await axios.post(
      "https://codebox-live-functions-west-us.azurewebsites.net/api/codeboxpostproject?code=QOFLsyQ07dtUzKViROs9zFUSKvS9tLqSpDu3JPk_J8SYAzFue2iPLw%3D%3D",
      projectData,
      {
        headers: {
          Authorization: `Bearer ${this.userId}`,
        },
      }
    );
    const projectResponse = response.data.data;
    if (isProjectResponse(projectResponse)) {
      return Promise.resolve(projectResponse);
    }
    return Promise.reject(
      new Error("CodeboxService: postProject invalid response")
    );
  }
  async getProject(id: string): Promise<IProject> {
    const url =
      "https://codebox-live-functions-west-us.azurewebsites.net/api/codeboxgetproject?code=p9I4HISDY4jDoszWFcuWUwBqJ7gkrrKWdC5KJ3O16JFEAzFuC5nS6g%3D%3D";
    const response = await axios.post(
      url,
      { id },
      {
        headers: {
          Authorization: `Bearer ${this.userId}`,
        },
      }
    );
    const projectResponse = response.data.data;

    if (isProjectResponse(projectResponse)) {
      return projectResponse.project;
    }
    throw Error("ProjectService.getProject: invalid response");
  }
  async setProject(project: ISetProject): Promise<IProject> {
    const url = `https://codebox-live-functions-west-us.azurewebsites.net/api/codeboxsetproject?code=yDDATx8PXrOFySQswTCxKRv2VssZhVuKERq7vCdqw3DHAzFu_M__tg%3D%3D`;
    const response = await axios.post(url, project, {
      headers: {
        Authorization: `Bearer ${this.userId}`,
      },
    });
    const projectResponse = response.data.data;
    if (isProjectResponse(projectResponse)) {
      return projectResponse.project;
    }
    throw Error("ProjectService.setProject: invalid response");
  }
  async deleteProject(project: IProject): Promise<void> {
    const url = `https://codebox-live-functions-west-us.azurewebsites.net/api/codeboxdeleteproject?code=UgZo4fr2zzoXdUBjXgBTkeFcAAdPwue7FNP6FU9hVZh7AzFuIkwU3Q%3D%3D`;
    await axios.post(
      url,
      {
        projectId: project._id,
      },
      {
        headers: {
          Authorization: `Bearer ${this.userId}`,
        },
      }
    );
    return Promise.resolve();
  }
}
