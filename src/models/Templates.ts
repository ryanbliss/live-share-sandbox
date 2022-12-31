export enum LanguageType {
  javascript = "js",
  typescript = "ts",
}

export enum FrameworkType {
  vanilla = "vanilla",
  react = "react",
  vue = "vue",
  svelte = "SvelteKit",
  angular = "Angular",
}

export interface IProjectTemplate {
  language: LanguageType;
  framework: FrameworkType;
  title: string;
  description: string;
  gitRemoteUrl: string;
  branch?: string;
}

export function isProjectTemplate(value: any): value is IProjectTemplate {
  return (
    value &&
    Object.values(LanguageType).includes(value.language) &&
    Object.values(FrameworkType).includes(value.framework) &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.gitRemoteUrl === "string" &&
    (value.branch === undefined || typeof value.branch === "string")
  );
}

export function isProjectTemplateList(value: any): value is IProjectTemplate[] {
  if (Array.isArray(value)) {
    return value.every((subValue) => isProjectTemplate(subValue));
  }
  return false;
}

export interface ICommunityTemplate extends IProjectTemplate {
  _id: string;
  createdAt: Date;
  createdById: string;
}
