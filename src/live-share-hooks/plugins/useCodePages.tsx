import { useCallback, useEffect, MutableRefObject, useRef } from "react";
import { IFluidContainer, SharedMap, SharedString } from "fluid-framework";
import {
  ISharedStringHelperTextChangedEventArgs,
  SharedStringHelper,
} from "@fluid-experimental/react-inputs";
import { useStateRef } from "../../utils/useStateRef";
import { buildEmptyReactComponent } from "../../sandpack-templates";

export function useCodePages(
  codePagesMap: SharedMap | undefined,
  container: IFluidContainer | undefined
): {
  pages: Map<string, SharedStringHelper>;
  files: Map<string, string>;
  filesRef: MutableRefObject<Map<string, string>>;
  onAddPage: (pageName: string) => void;
  setFiles: (value: Map<string, string>) => void;
} {
  const [pages, pagesRef, setPages] = useStateRef<
    Map<string, SharedStringHelper>
  >(new Map());
  const [files, filesRef, setFiles] = useStateRef<Map<string, string>>(
    new Map()
  );
  const listeningForRef = useRef<any>({});

  const onRefreshPages = useCallback(async () => {
    if (!codePagesMap) {
      return;
    }
    const _handles: Map<string, any> = new Map();
    codePagesMap.forEach((value, key) => {
      _handles.set(key, value);
    });
    const _pages: Map<string, SharedStringHelper> = new Map();
    const keys = [..._handles.keys()];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let pageValue: SharedStringHelper;
      const handleValue = _handles.get(key);
      const sharedString = (await handleValue.get()) as SharedString;
      console.log("setting SharedStringHelper for", key);
      pageValue = new SharedStringHelper(sharedString);
      _pages.set(key, pageValue);
    }
    setPages(_pages);
  }, [codePagesMap, pagesRef, setPages, setFiles]);

  const onAddPage = useCallback(
    (pageName: string) => {
      if (container) {
        container
          .create(SharedString)
          .then((sharedString) => {
            (container.initialObjects.codePagesMap as SharedMap).set(
              `/${pageName}.js`,
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

  const onTextChange = useCallback(
    (event: ISharedStringHelperTextChangedEventArgs | undefined) => {
      console.log("onTextChange local", event?.isLocal, pagesRef.current.size);

      let valueHasChanged = false;
      const _files: Map<string, string> = new Map();
      pagesRef.current.forEach((sharedStringHelper, fileName) => {
        const newText = sharedStringHelper.getText();
        const checkValue = filesRef.current.get(fileName);
        if (!checkValue || checkValue !== newText) {
          valueHasChanged = true;
        }
        _files.set(fileName, newText);
      });

      if (pagesRef.current.size > 0 && event?.isLocal) {
        console.log("updating local ref");
        filesRef.current = _files;
        return;
      }
      if (valueHasChanged) {
        console.log("onTextChange change for local is", event?.isLocal);
        setFiles(_files);
      }
    },
    [filesRef, pagesRef, setFiles]
  );

  useEffect(() => {
    function getHandleTextChangedCallback(): (
      event: ISharedStringHelperTextChangedEventArgs | undefined
    ) => void {
      const handleTextChanged = (
        event: ISharedStringHelperTextChangedEventArgs | undefined
      ) => {
        // SharedStringHelper getText() needs to yield before it returns the updated value, so we setTimeout for 0
        setTimeout(() => {
          onTextChange(event);
        }, 0);
      };
      return handleTextChanged;
    }
    pages.forEach((value, key) => {
      if (!listeningForRef.current[key]) {
        console.log("starting listening for", key);
        listeningForRef.current[key] = true;
        value.on("textChanged", getHandleTextChangedCallback());
        getHandleTextChangedCallback()(undefined);
      }
    });
    return () => {
      pagesRef.current.forEach((value, key) => {
        value.off("textChanged", getHandleTextChangedCallback());
      });
    };
  }, [pages, filesRef, pagesRef, listeningForRef, setFiles, onTextChange]);

  return {
    pages,
    files,
    filesRef,
    onAddPage,
    setFiles,
  };
}
