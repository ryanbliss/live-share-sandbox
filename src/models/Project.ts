export enum IProjectType {
  REACT = "react",
  REACT_TS = "react-ts",
}

export interface IProject {
  _id: string;
  containerId: string;
  title: string;
  type: IProjectType;
  createdAt: string;
  createdById: string;
  sandboxContainerId?: string;
}

export interface IPostProject {
  containerId: string;
  title: string;
  type: IProjectType;
}

export interface ISetProject extends Partial<IProject> {
  _id: string;
}

export interface IUserProjectsResponse {
  projects: IProject[];
}

export interface IPostProjectResponse {
  project: IProject;
}
