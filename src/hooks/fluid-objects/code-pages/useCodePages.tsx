import { useCallback, useEffect, MutableRefObject, useRef } from "react";
import { IFluidContainer, SharedMap, SharedString } from "fluid-framework";
import { useStateRef } from "../..";
import { buildEmptyReactComponent } from "../../../sandpack-templates";

export function useCodePages(
  codePagesMap: SharedMap | undefined,
  container: IFluidContainer | undefined
): {
  codeFiles: Map<string, SharedString>;
  codeFilesRef: MutableRefObject<Map<string, SharedString>>;
  onAddPage: (pageName: string) => void;
} {
  const [codeFiles, codeFilesRef, setCodeFiles] = useStateRef<
    Map<string, SharedString>
  >(new Map());
  // Started reference for having wired up initial event valueChanged
  // listeners for the codePageMap
  const startedRef = useRef<boolean>(false);

  // Callback that updates the code files we are tracking with the
  // latest from our codePagesMap.
  const onRefreshPages = useCallback(() => {
    // We use a setTimeout to yield changes so that our SharedString
    // can apply its own SharedString listener before this code runs.
    setTimeout(async () => {
      if (!codePagesMap) return;

      // Get the DDS handles for each SharedString stored in the codePagesMap
      const _handles: Map<string, any> = new Map();
      codePagesMap.forEach((value, key) => {
        _handles.set(key, value);
      });
      const files: Map<string, SharedString> = new Map();
      const keys = [..._handles.keys()];
      // Build our files object by iterating through each SharedString
      // in our codeFilesMap
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        let sharedString: SharedString;
        const existingCodeFile = codeFilesRef.current.get(key);
        if (existingCodeFile) {
          // We already have a SharedString tracked for this key
          // so we use that.
          sharedString = existingCodeFile;
        } else {
          // We are not tracking a SharedString for this key
          // so we get it using the DDS handle.
          const handleValue = _handles.get(key);
          sharedString = (await handleValue.get()) as SharedString;
        }

        files.set(key, sharedString);
      }
      setCodeFiles(files);
    }, 0);
  }, [codePagesMap, setCodeFiles]);

  // Callback exported to the UI so that user can add new components
  const onAddPage = useCallback(
    (pageName: string) => {
      if (container) {
        // Create a new SharedString object in our container
        container
          .create(SharedString)
          .then((sharedString) => {
            // Set the handle for the DDS into the codePagesMap
            // TODO: allow more file types than tsx
            (container.initialObjects.codePagesMap as SharedMap).set(
              `/${pageName}.tsx`,
              sharedString.handle
            );
            // Insert the starting text for the SharedString with an empty React component
            // TODO: support JSX templates different templates and fill as empty if a vanilla
            // JS, TS, HTML, or CSS component.
            sharedString.insertText(0, buildEmptyReactComponent(pageName));
          })
          .catch((error) => console.error(error));
      }
    },
    [container]
  );

  useEffect(() => {
    if (codePagesMap) {
      // Listen for changes to the code files
      codePagesMap.on("valueChanged", onRefreshPages);
      if (!startedRef.current) {
        // On initial mount, get the initial values for our pages
        onRefreshPages();
      }
    }
    // Remove event listeners when the hook unmounts
    return () => {
      codePagesMap?.off("valueChanged", onRefreshPages);
    };
  }, [codePagesMap, onRefreshPages]);

  return {
    codeFiles,
    codeFilesRef,
    onAddPage,
  };
}
