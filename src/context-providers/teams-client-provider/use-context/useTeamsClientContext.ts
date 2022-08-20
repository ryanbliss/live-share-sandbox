import { useContext } from "react";
import { ITeamsClientContext } from "../../../models";
import { TeamsClientContext } from "../internals";

export const useTeamsClientContext = (): ITeamsClientContext => {
  const context = useContext(TeamsClientContext);
  return context;
};
