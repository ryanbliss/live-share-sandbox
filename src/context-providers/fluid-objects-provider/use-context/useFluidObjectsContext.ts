import { useContext } from "react";
import { IFluidObjectsContext } from "../../../models";
import { FluidObjectsContext } from "../internals";

export const useFluidObjectsContext = (): IFluidObjectsContext => {
  const context = useContext(FluidObjectsContext);
  return context;
};
