import { useCallback, useEffect, MutableRefObject, useRef } from "react";
import { IFluidContainer, SharedMap, SharedString } from "fluid-framework";
import {
  ISharedStringHelperTextChangedEventArgs,
  SharedStringHelper,
} from "@fluid-experimental/react-inputs";
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
  const startedRef = useRef<boolean>(false);
  const listeningForRef = useRef<any>({});

  const onRefreshPages = useCallback(() => {
    setTimeout(async () => {
      if (!codePagesMap) {
        return;
      }
      const _handles: Map<string, any> = new Map();
      codePagesMap.forEach((value, key) => {
        _handles.set(key, value);
      });
      const files: Map<string, ICodeFile> = new Map();
      const keys = [..._handles.keys()];
      let valueChanged = false;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        let stringHelper: SharedStringHelper;
        const existingCodeFile = codeFilesRef.current.get(key);
        if (existingCodeFile && existingCodeFile.stringHelper) {
          stringHelper = existingCodeFile.stringHelper;
        } else {
          const handleValue = _handles.get(key);
          const sharedString = (await handleValue.get()) as SharedString;
          console.log("setting SharedStringHelper for", key);
          stringHelper = new SharedStringHelper(sharedString);
        }
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
        setCodeFiles(files);
      }
    }, 0);
  }, [codePagesMap, setCodeFiles]);

  const onAddPage = useCallback(
    (pageName: string) => {
      if (container) {
        container
          .create(SharedString)
          .then((sharedString) => {
            (container.initialObjects.codePagesMap as SharedMap).set(
              `/${pageName}.tsx`,
              sharedString.handle
            );
            sharedString.insertText(0, buildEmptyReactComponent(pageName));
          })
          .catch((error) => console.error(error));
      }
    },
    [container]
  );

  useEffect(() => {
    if (codePagesMap) {
      codePagesMap.on("valueChanged", onRefreshPages);
      if (!startedRef.current) {
        onRefreshPages();
      }
    }
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
