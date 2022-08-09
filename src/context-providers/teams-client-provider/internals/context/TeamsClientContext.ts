import { createContext } from "react";
import { ITeamsClientContext } from "../../../../models";

export const TeamsClientContext = createContext<ITeamsClientContext>(
  {} as ITeamsClientContext
);
