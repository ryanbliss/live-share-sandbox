import { EphemeralPresence, EphemeralState } from "@microsoft/live-share";
import { IFluidContainer, SharedMap, SharedString } from "fluid-framework";
import { MutableRefObject } from "react";
import { IFollowModeStateValue } from "./IFollowModeStateValue";
import { IUser } from "./IUser";
import { app } from "@microsoft/teams-js";
import { SandpackFiles } from "@codesandbox/sandpack-react";

export interface ILiveShareContext {
  loading: boolean;
  error: Error | undefined;
  container: IFluidContainer | undefined;
  codePagesMap: SharedMap | undefined;
  sandpackObjectsMap: SharedMap | undefined;
  followModeState: EphemeralState<IFollowModeStateValue> | undefined;
  presence: EphemeralPresence | undefined;
  userDidCreateContainerRef: MutableRefObject<boolean> | undefined;
}

export interface ICodePagesContext {
  codeFiles: Map<string, SharedString>;
  codeFilesRef: MutableRefObject<Map<string, SharedString>>;
  onAddPage: (pageName: string) => void;
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
  localUserIsEligiblePresenter: boolean;
  users: IUser[];
  currentPageKey: string;
  onChangeCurrentPageKey: (currentPageKey: string) => void;
}

export interface IFluidObjectsContext
  extends ILiveShareContext,
    ICodePagesContext,
    IFollowModeStateContext,
    IPresenceContext {
  teamsContext: app.Context | undefined;
  mappedSandpackFiles: SandpackFiles;
  onChangeSelectedFile: (fileName: string) => void;
}
