import { createContext } from "react";
import { IFluidObjectsContext } from "../../../../models";

export const FluidObjectsContext = createContext<IFluidObjectsContext>(
  {} as IFluidObjectsContext
);
