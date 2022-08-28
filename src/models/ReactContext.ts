import { EphemeralPresence, EphemeralState } from "@microsoft/live-share";
import { IFluidContainer, SharedMap, SharedString } from "fluid-framework";
import { MutableRefObject } from "react";
import { IFollowModeStateValue } from "./IFollowModeStateValue";
import { IUser } from "./IUser";
import { app } from "@microsoft/teams-js";
import { SandpackFiles } from "@codesandbox/sandpack-react";
import { ICursor } from "./Cursor";
import { IProject, IProjectTemplate } from "./Project";
import { CodeFilesHelper } from "./CodeFilesHelper";

export interface IFluidContainerResults {
  loading: boolean;
  error: Error | undefined;
  container: IFluidContainer | undefined;
  codePagesMap: SharedMap | undefined;
}

export interface ICodePagesContext {
  codeFiles: Map<string, SharedString>;
  codeFilesRef: MutableRefObject<Map<string, SharedString>>;
  onAddPage: (pageName: string) => void;
}

export interface IFluidObjectsContext
  extends IFluidContainerResults,
    ICodePagesContext {
  teamsContext: app.Context | undefined;
  mappedSandpackFiles: SandpackFiles;
  codeFilesHelper: CodeFilesHelper;
  codeFilesHelperRef: MutableRefObject<CodeFilesHelper | undefined>;
  currentPageKey: string | undefined;
  onChangeSelectedFile: (currentPageKey: string | undefined) => void;
}

// Live Share

export interface ILiveShareContainerResults {
  loading: boolean;
  error: Error | undefined;
  container: IFluidContainer | undefined;
  sandpackObjectsMap: SharedMap | undefined;
  followModeState: EphemeralState<IFollowModeStateValue> | undefined;
  presence: EphemeralPresence | undefined;
  userDidCreateContainerRef: MutableRefObject<boolean> | undefined;
}

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

export interface ILiveShareContext
  extends ILiveShareContainerResults,
    IFollowModeStateContext,
    IPresenceContext {
  teamsContext: app.Context | undefined;
  onChangeSelectedFile: (fileName: string | undefined) => void;
}

// Teams Client Context

export interface ITeamsClientContext {
  teamsContext: app.Context | undefined;
}

// Codebox Live Context

export interface ICodeboxLiveContext {
  userProjects: IProject[];
  userProjectsRef: MutableRefObject<IProject[]>;
  currentProject: IProject | undefined;
  projectTemplates: IProjectTemplate[];
  loading: boolean;
  error: Error | undefined;
  createProject: (template: IProjectTemplate) => Promise<void>;
  editProject: (project: IProject) => Promise<void>;
}
