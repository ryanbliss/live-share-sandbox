export enum IProjectType {
  REACT = "react",
  REACT_TS = "react-ts",
}

export interface IProject {
  containerId: string;
  title: string;
  type: IProjectType;
  createdAt: string;
  createdById: string;
}

export interface IPostProject {
  containerId: string;
  title: string;
  type: IProjectType;
}

export interface IUserProjectsResponse {
  projects: IProject[];
}

export interface IPostProjectResponse {
  project: IProject;
}
