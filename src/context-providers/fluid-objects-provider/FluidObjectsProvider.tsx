import { SandpackFiles } from "@codesandbox/sandpack-react";
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { LoadableWrapper } from "../../components/view-wrappers";
import { CodeFilesHelper, IFluidObjectsContext } from "../../models";
import { useTeamsClientContext } from "../teams-client-provider";
import {
  useCodePages,
  useFluidContainerResults,
  useFollowModeState,
  usePresence,
} from "./internals";

// React Context
const FluidObjectsContext = createContext<IFluidObjectsContext>(
  {} as IFluidObjectsContext
);

// React useContext
export const useFluidObjectsContext = (): IFluidObjectsContext => {
  const context = useContext(FluidObjectsContext);
  return context;
};

// React Context Provider
export const FluidObjectsProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { teamsContext } = useTeamsClientContext();
  const fluidContainerResults = useFluidContainerResults();

  // Get the latest codeFiles map and a callback to create a new page
  const codeFilesData = useCodePages(
    fluidContainerResults.codePagesMap,
    fluidContainerResults.container
  );

  // Get the current follow state and callbacks to start/end follow mode
  const followModeStateData = useFollowModeState(
    fluidContainerResults.followModeState,
    teamsContext?.user?.id
  );

  // Use presence to track local user and the page they should be looking at,
  // as well as callback to change their current page.
  const presenceData = usePresence(
    fluidContainerResults.presence,
    teamsContext,
    "/App.tsx",
    followModeStateData.followingUserId
  );

  const currentPageKey = useMemo<string | undefined>(() => {
    // TODO: replace hardcoded default page
    return presenceData.currentPageKey || "/App.tsx";
  }, [presenceData.currentPageKey]);

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
    return _files;
  }, [codeFilesData.codeFiles, currentPageKey]);

  // Code files helper
  const codeFilesHelperRef = useRef<CodeFilesHelper | undefined>();
  const codeFilesHelper = useMemo(() => {
    codeFilesHelperRef.current = new CodeFilesHelper(
      codeFilesData.codeFiles,
      currentPageKey
    );
    return codeFilesHelperRef.current;
  }, [codeFilesData.codeFiles, currentPageKey]);

  // Callback to change the currently selected file
  const onChangeSelectedFile = useCallback(
    (newPageKey: string | undefined) => {
      // Change the file that the user has set as their current file.
      presenceData.onChangeCurrentPageKey(newPageKey);

      // If follow mode is active and the user is an eligible presenter
      // but is not in control, take control so that other users are now
      // following them.
      if (
        followModeStateData.followingUserId &&
        followModeStateData.followingUserId !==
          presenceData.localUser?.userId &&
        presenceData.localUserIsEligiblePresenter
      ) {
        followModeStateData.onInitiateFollowMode();
      }
    },
    [presenceData, followModeStateData]
  );

  return (
    <FluidObjectsContext.Provider
      value={{
        ...fluidContainerResults,
        ...codeFilesData,
        ...presenceData,
        ...followModeStateData,
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
