import { createContext } from "react";
import { ICodeboxLiveContext } from "../../../../models";

export const CodeboxLiveContext = createContext<ICodeboxLiveContext>(
  {} as ICodeboxLiveContext
);
