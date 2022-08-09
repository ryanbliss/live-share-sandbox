import { createContext } from "react";
import { ILiveShareContext } from "../../../../models";

export const LiveShareContext = createContext<Partial<ILiveShareContext>>(
  {} as Partial<ILiveShareContext>
);
