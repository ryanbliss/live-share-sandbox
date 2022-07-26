import { IFluidContainer } from "fluid-framework";
import { MutableRefObject, useEffect, useRef, useState } from "react";

export const useContainerEditable = (
  container: IFluidContainer | undefined
): {
  editableRef: MutableRefObject<boolean>;
} => {
  const listeningRef = useRef<boolean>(false);
  const editableRef = useRef<boolean>(true);
  useEffect(() => {
    if (listeningRef.current || !container) {
      return;
    }
    const onSaved = () => {
      editableRef.current = true;
    };
    const onDirty = () => {
      editableRef.current = false;
    };
    container?.on("saved", onSaved);
    container?.on("dirty", onDirty);
    return () => {
      container?.off("saved", onSaved);
      container?.on("dirty", onDirty);
    };
  }, [container]);

  return {
    editableRef,
  };
};
