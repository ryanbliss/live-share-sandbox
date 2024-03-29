import { LivePresence, LiveState } from "@microsoft/live-share";
import { IFluidContainer, SharedMap, SharedString } from "fluid-framework";
import { MutableRefObject } from "react";
import { IFollowModeStateValue } from "./IFollowModeStateValue";
import { IUser } from "./IUser";
import { app } from "@microsoft/teams-js";
import { SandpackFiles } from "@codesandbox/sandpack-react";
import { ICursor } from "./Cursor";
import { IProject, ISetProject } from "./Project";
import { CodeFilesHelper } from "./CodeFilesHelper";
import { IProjectTemplate } from "./Templates";

export interface IFluidContainerResults {
  loading: boolean;
  error: Error | undefined;
  container: IFluidContainer | undefined;
  codePagesMap: SharedMap | undefined;
  sandpackObjectsMap: SharedMap | undefined;
  followModeState: LiveState<IFollowModeStateValue> | undefined;
  presence: LivePresence | undefined;
}

export interface ICodePagesContext {
  codeFiles: Map<string, SharedString>;
  codeFilesRef: MutableRefObject<Map<string, SharedString>>;
  onAddPage: (pageName: string) => void;
}

export interface IFluidObjectsContext
  extends IFluidContainerResults,
    ICodePagesContext,
    IFollowModeStateContext,
    IPresenceContext {
  teamsContext: app.Context | undefined;
  mappedSandpackFiles: SandpackFiles;
  codeFilesHelper: CodeFilesHelper;
  codeFilesHelperRef: MutableRefObject<CodeFilesHelper | undefined>;
  currentPageKey: string | undefined;
  onChangeSelectedFile: (currentPageKey: string | undefined) => void;
}

// Live Share

export interface IFollowModeStateContext {
  followModeStateStarted: boolean;
  followingUserId?: string;
  onInitiateFollowMode: () => void;
  onEndFollowMode: () => void;
}

export interface IPresenceContext {
  presenceStarted: boolean;
  localUser: IUser | undefined;
  localUserRef: MutableRefObject<IUser | undefined>;
  localUserIsEligiblePresenter: boolean;
  users: IUser[];
  otherUsers: IUser[];
  currentPageKey: string | undefined;
  onChangeCurrentPageKey: (currentPageKey: string | undefined) => void;
  onChangeCursor: (cursor: ICursor) => void;
}

// Teams Client Context

export interface ITeamsClientContext {
  teamsContext: app.Context | undefined;
}

// Codebox Live Context

export interface ICodeboxLiveContext {
  userProjects: IProject[];
  recentProjects: IProject[];
  pinnedProjects: IProject[];
  currentProject: IProject | undefined;
  projectTemplates: IProjectTemplate[] | undefined;
  loading: boolean;
  error: Error | undefined;
  createProject: (template: IProjectTemplate) => Promise<void>;
  setProject: (projectData: ISetProject) => Promise<IProject>;
  deleteProject: (project: IProject) => Promise<void>;
  pinProjectToTeams: (project: IProject, threadId: string) => Promise<void>;
}
