import { useContext } from "react";
import { ILiveShareContext } from "../../../models";
import { LiveShareContext } from "../internals";

export const useLiveShareContext = (): ILiveShareContext => {
  const liveShareContext = useContext(LiveShareContext);
  return liveShareContext;
};
