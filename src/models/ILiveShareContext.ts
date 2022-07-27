import { EphemeralPresence, EphemeralState } from "@microsoft/live-share";
import { IFluidContainer, SharedMap } from "fluid-framework";
import { MutableRefObject } from "react";
import { IFollowModeStateValue } from ".";

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
