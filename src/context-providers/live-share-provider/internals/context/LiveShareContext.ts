import { createContext } from "react";
import { ILiveShareContext } from "../../../../models";

export const LiveShareContext = createContext<ILiveShareContext>({
  loading: true,
  error: undefined,
  container: undefined,
  codePagesMap: undefined,
  sandpackObjectsMap: undefined,
  followModeState: undefined,
  presence: undefined,
  userDidCreateContainerRef: undefined,
});
