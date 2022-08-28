export enum ProjectType {
  REACT = "react",
  REACT_TS = "react-ts",
}

export enum ProjectLanguageType {
  TYPESCRIPT = "TypeScript",
  JAVASCRIPT = "JavaScript",
}

export enum ProjectFrameworkType {
  REACT = "React",
  VUE = "Vue",
  ANGULAR = "Angular",
  SVELTE = "Svelte",
  VANILLA = "Vanilla",
}

export interface IProject {
  _id: string;
  containerId?: string;
  title: string;
  type: ProjectType;
  createdAt: string;
  createdById: string;
  sandboxContainerId?: string;
}

export interface IPostProject {
  title: string;
  type: ProjectType;
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

export interface IProjectTemplate {
  id: string;
  name: string;
  language: ProjectLanguageType;
  framework?: ProjectFrameworkType;
  repository: URL;
  branch?: string;
  type: ProjectType;
}
