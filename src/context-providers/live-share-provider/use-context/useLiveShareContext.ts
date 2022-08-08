import { useContext } from "react";
import { ILiveShareContext } from "../../../models";
import { LiveShareContext } from "../internals";

export const useLiveShareContext = (): Partial<ILiveShareContext> => {
  const context = useContext(LiveShareContext);
  return context;
};
