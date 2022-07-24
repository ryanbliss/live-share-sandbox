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
  const [codeFiles, codeFilesRef, setCodeFilesRef] = useStateRef<
    Map<string, ICodeFile>
  >(new Map());
  const listeningForRef = useRef<any>({});

  const onRefreshPages = useCallback(async () => {
    if (!codePagesMap) {
      return;
    }
    const _handles: Map<string, any> = new Map();
    codePagesMap.forEach((value, key) => {
      _handles.set(key, value);
    });
    const files: Map<string, ICodeFile> = new Map();
    const keys = [..._handles.keys()];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const handleValue = _handles.get(key);
      const sharedString = (await handleValue.get()) as SharedString;
      console.log("setting SharedStringHelper for", key);
      const stringHelper = new SharedStringHelper(sharedString);
      files.set(key, {
        stringHelper,
        text: stringHelper.getText(),
      });
    }
    setCodeFilesRef(files);
  }, [codePagesMap, setCodeFilesRef]);

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
      onRefreshPages();
    }
    return () => {
      codePagesMap?.off("valueChanged", onRefreshPages);
    };
  }, [codePagesMap, onRefreshPages]);

  useEffect(() => {
    const onTextChange = (
      event: ISharedStringHelperTextChangedEventArgs | undefined
    ) => {
      setTimeout(() => {
        console.log(
          "onTextChange local",
          event?.isLocal,
          codeFilesRef.current.size
        );
        if (!event?.isLocal) {
          onRefreshPages();
        }
      });
    };
    codeFiles.forEach((value, key) => {
      if (!listeningForRef.current[key]) {
        console.log("starting listening for", key);
        listeningForRef.current[key] = true;
        value.stringHelper.on("textChanged", onTextChange);
        onTextChange(undefined);
      }
    });
    return () => {
      codeFilesRef.current.forEach((value, key) => {
        value.stringHelper.off("textChanged", onTextChange);
      });
    };
  }, [codeFiles, codeFilesRef, listeningForRef]);

  return {
    codeFiles,
    codeFilesRef,
    onAddPage,
  };
}
