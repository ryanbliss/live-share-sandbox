export enum LanguageType {
  javascript = "JavaScript",
  typescript = "TypeScript",
}

export function isLanguageType(value: any): value is LanguageType {
  return Object.values(LanguageType).includes(value);
}

export enum FrameworkType {
  vanilla = "Vanilla",
  react = "React",
  vue = "Vue",
  svelte = "SvelteKit",
  angular = "Angular",
}

export function isFrameworkType(value: any): value is FrameworkType {
  return Object.values(FrameworkType).includes(value);
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
