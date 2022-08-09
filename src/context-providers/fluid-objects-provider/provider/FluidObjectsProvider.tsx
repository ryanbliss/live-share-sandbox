import { SandpackFiles } from "@codesandbox/sandpack-react";
import { FC, ReactNode, useMemo, useRef } from "react";
import { LoadableWrapper } from "../../../components/view-wrappers";
import { CodeFilesHelper } from "../../../models";
import {
  LiveShareSandboxApi,
  WindowMessagingApi,
} from "../../../sandpack-templates";
import { useTeamsClientContext } from "../../teams-client-provider";
import {
  FluidObjectsContext,
  useCodePages,
  useCurrentCodePage,
  useFluidContainerResults,
} from "../internals";

export const FluidObjectsProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { teamsContext } = useTeamsClientContext();
  const { currentPageKey, onChangeSelectedFile } = useCurrentCodePage();
  const fluidContainerResults = useFluidContainerResults();

  // Get the latest codeFiles map and a callback to create a new page
  const codeFilesData = useCodePages(
    fluidContainerResults.codePagesMap,
    fluidContainerResults.container
  );

  // Take the code pages stored in our map and combine with static
  // read-only files that will be hidden from the user.
  const mappedSandpackFiles = useMemo<SandpackFiles>(() => {
    const _files: SandpackFiles = {};
    codeFilesData.codeFiles.forEach((file, key) => {
      _files[key] = {
        code: file.getText(),
        hidden: false,
        active: key === currentPageKey,
        readOnly: false,
      };
    });
    _files["/LiveShareSandboxApi.ts"] = {
      code: LiveShareSandboxApi,
      hidden: true,
      active: false,
      readOnly: true,
    };
    _files["/WindowMessagingApi.ts"] = {
      code: WindowMessagingApi,
      hidden: true,
      active: false,
      readOnly: true,
    };
    return _files;
  }, [codeFilesData.codeFiles, currentPageKey]);

  const codeFilesHelperRef = useRef<CodeFilesHelper | undefined>();
  const codeFilesHelper = useMemo(() => {
    codeFilesHelperRef.current = new CodeFilesHelper(
      codeFilesData.codeFiles,
      currentPageKey
    );
    return codeFilesHelperRef.current;
  }, [codeFilesData.codeFiles, currentPageKey]);

  return (
    <FluidObjectsContext.Provider
      value={{
        ...fluidContainerResults,
        ...codeFilesData,
        teamsContext,
        mappedSandpackFiles,
        currentPageKey,
        codeFilesHelper,
        codeFilesHelperRef,
        onChangeSelectedFile,
      }}
    >
      <LoadableWrapper
        loading={fluidContainerResults.loading}
        error={fluidContainerResults.error}
      >
        {children}
      </LoadableWrapper>
    </FluidObjectsContext.Provider>
  );
};
