import axios from "axios";
import {
  IProject,
  IUserProjectsResponse,
  IPostProject,
  IPostProjectResponse,
  ISetProject,
  isProject,
} from "../models";
import { IProjectTemplate, isProjectTemplateList } from "../models/Templates";

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
  public async getRecentProjects(): Promise<IUserProjectsResponse> {
    if (!this.userId) {
      return Promise.reject(
        new Error(
          "CodeboxService: called getUserProjects before user is authorized"
        )
      );
    }
    const response = await axios.get(
      "https://codebox-live-functions-west-us.azurewebsites.net/api/codeboxgetrecentprojects?code=fDpkYTxrmZ3BT6qTHeDJloaM9M3MleSsKUeaR_m_RP1jAzFuYGXdfQ%3D%3D",
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
  public async getTeamsPinnedProjects(
    threadId: string
  ): Promise<IUserProjectsResponse> {
    if (!this.userId) {
      return Promise.reject(
        new Error(
          "CodeboxService: called getUserProjects before user is authorized"
        )
      );
    }
    const response = await axios.post(
      "https://codebox-live-functions-west-us.azurewebsites.net/api/codeboxgetteamspinnedprojects?code=06yJSpejPQm99RNMV45S-1H_TUOKV-nccKzkVR4U9qvYAzFukmdYfA%3D%3D",
      {
        threadId,
      },
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
  public async postProjectView(projectId: string): Promise<void> {
    if (!this.userId) {
      return Promise.reject(
        new Error(
          "CodeboxService: called getUserProjects before user is authorized"
        )
      );
    }
    await axios.post(
      "https://codebox-live-functions-west-us.azurewebsites.net/api/codeboxpostprojectview?code=QQNcobhUDCzyshVSdYKxURBVKmT2bxCqKWal1V7QeTvVAzFuv6qXHw%3D%3D",
      {
        projectId,
      },
      {
        headers: {
          Authorization: `Bearer ${this.userId}`,
        },
      }
    );
  }
  public async postTeamsProjectTeamsThreadPin(
    projectId: string,
    threadId: string
  ): Promise<void> {
    if (!this.userId) {
      return Promise.reject(
        new Error(
          "CodeboxService: called getUserProjects before user is authorized"
        )
      );
    }
    await axios.post(
      "https://codebox-live-functions-west-us.azurewebsites.net/api/codeboxpostprojectteamsthreadpin?code=fbXhSmMdlOfBYj_Ck1r7zLTQpbS0uWBFejst4Sy7OG4iAzFuyzMTjQ%3D%3D",
      {
        projectId,
        threadId,
      },
      {
        headers: {
          Authorization: `Bearer ${this.userId}`,
        },
      }
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
  async getTemplates(): Promise<IProjectTemplate[]> {
    const url = `https://codebox-live-functions-west-us.azurewebsites.net/api/codeboxgettemplates?code=39ahg98I5MVqUZrs6CCXhf8IQTnxECbYI8A3LRQRMXRYAzFupFVItw%3D%3D`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${this.userId}`,
      },
    });
    const templateList = response.data.data;
    if (isProjectTemplateList(templateList)) {
      return templateList;
    }
    throw Error("ProjectsService.getTemplates: invalid response");
  }
}
