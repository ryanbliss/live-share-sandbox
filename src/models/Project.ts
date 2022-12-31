import { FrameworkType, LanguageType } from "./Templates";

export interface IProject {
  _id: string;
  containerId?: string;
  title: string;
  language: LanguageType;
  framework: FrameworkType;
  createdAt: string;
  createdById: string;
  sandboxContainerId?: string;
}

export function isProject(value: any): value is IProject {
  return (
    value &&
    (typeof value.containerId === "string" ||
      value.containerId === undefined) &&
    typeof value.title === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.createdById === "string" &&
    Object.values(FrameworkType).includes(value.framework) &&
    Object.values(LanguageType).includes(value.language)
  );
}

export interface IPostProject {
  title: string;
  language: LanguageType;
  framework: FrameworkType;
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
