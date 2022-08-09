import { useContext } from "react";
import { ICodeboxLiveContext } from "../../../models";
import { CodeboxLiveContext } from "../internals";

export const useCodeboxLiveContext = (): ICodeboxLiveContext => {
  const context = useContext(CodeboxLiveContext);
  return context;
};
