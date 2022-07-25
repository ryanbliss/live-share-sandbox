import { useCallback, useEffect, MutableRefObject, useRef } from "react";
import { IFluidContainer, SharedMap, SharedString } from "fluid-framework";
import { SharedStringHelper } from "@fluid-experimental/react-inputs";
import { useStateRef } from "../../utils/useStateRef";
import { buildEmptyReactComponent } from "../../sandpack-templates";
import { ICodeFile } from "../../models/ICodeFile";

export function useCodePages(
  codePagesMap: SharedMap | undefined,
  container: IFluidContainer | undefined
): {
  codeFiles: Map<string, ICodeFile>;
  codeFilesRef: MutableRefObject<Map<string, ICodeFile>>;
  onAddPage: (pageName: string) => void;
} {
  const [codeFiles, codeFilesRef, setCodeFiles] = useStateRef<
    Map<string, ICodeFile>
  >(new Map());
  // Started reference for having wired up initial event valueChanged
  // listeners for the codePageMap
  const startedRef = useRef<boolean>(false);
  // Reference map to check if the textChanged event listener is active
  // for the SharedString instances nested within the codePageMap
  const listeningForRef = useRef<any>({});

  // Callback that updates the code files we are tracking with the
  // latest from our codePagesMap. Also applies textChanged listeners
  // to our SharedStringHelper if needed, and applies the latest text values
  // to the codeFiles state.
  const onRefreshPages = useCallback(() => {
    // We use a setTimeout to yield changes so that our SharedStringHelper
    // can apply its own SharedString listener before this code runs.
    setTimeout(async () => {
      if (!codePagesMap) return;

      // Get the DDS handles for each SharedString stored in the codePagesMap
      const _handles: Map<string, any> = new Map();
      codePagesMap.forEach((value, key) => {
        _handles.set(key, value);
      });
      const files: Map<string, ICodeFile> = new Map();
      const keys = [..._handles.keys()];
      let valueChanged = false;
      // Build our files object by iterating through each SharedString
      // in our codeFilesMap
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        let stringHelper: SharedStringHelper;
        const existingCodeFile = codeFilesRef.current.get(key);
        if (existingCodeFile && existingCodeFile.stringHelper) {
          // We already have a SharedStringHelper tracked for this key
          // so we use that.
          stringHelper = existingCodeFile.stringHelper;
        } else {
          // We are not tracking a SharedStringHelper for this key
          // so we get it using the DDS handle.
          const handleValue = _handles.get(key);
          const sharedString = (await handleValue.get()) as SharedString;
          console.log("setting SharedStringHelper for", key);
          // TODO: we don't want to keep using SharedStringHelper
          // because it abstracts out our ability to see individual
          // incoming transforms. That limits our ability to let
          // multiple people type, so we will replace it with an adapter
          // for Monaco editor and SharedString, using SharedStringHelper
          // as a reference.
          stringHelper = new SharedStringHelper(sharedString);
        }
        // If the text has changed since we last checked it for this file
        // then we set our valueChanged flag to true.
        const text = stringHelper.getText();
        if (!existingCodeFile || existingCodeFile.text !== text) {
          valueChanged = true;
        }

        // Listen for changes to text if needed
        if (!listeningForRef.current[key]) {
          console.log("starting listening for", key);
          listeningForRef.current[key] = true;
          stringHelper.on("textChanged", onRefreshPages);
        }

        files.set(key, {
          stringHelper,
          text,
        });
      }
      if (valueChanged) {
        // Since a value in our code page files has changed, we
        // update our codeFiles map so our app can consume the
        // latest changes to the pages and/or text.
        setCodeFiles(files);
      }
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
        // and their corresponding text.
        onRefreshPages();
      }
    }
    // Remove event listeners when the hook unmounts
    return () => {
      codePagesMap?.off("valueChanged", onRefreshPages);
      codeFilesRef.current.forEach((value, key) => {
        console.log("stopping listening for", key);
        listeningForRef.current[key] = false;
        value.stringHelper.off("textChanged", onRefreshPages);
      });
    };
  }, [codePagesMap, onRefreshPages]);

  return {
    codeFiles,
    codeFilesRef,
    onAddPage,
  };
}
