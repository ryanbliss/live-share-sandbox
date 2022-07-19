import {
  FC,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  SandpackThemeProvider,
} from "@codesandbox/sandpack-react";
import { IFluidContainer, SharedMap } from "fluid-framework";
import * as microsoftTeams from "@microsoft/teams-js";
import { useCodePages } from "../../live-share-hooks/plugins/useCodePages";
import { CodeMirrorRef } from "@codesandbox/sandpack-react/dist/types/components/CodeEditor/CodeMirror";
import SandpackEditor from "./sandpack-editor/SandpackEditor";
import { EditorSelection } from "@codemirror/state";
import { EphemeralPresence, EphemeralState } from "@microsoft/live-share";
import {
  IFollowModeStateValue,
  useFollowModeState,
} from "../../live-share-hooks/plugins/useFollowModeState";
import { usePresence } from "../../live-share-hooks/plugins/usePresence";
import { SandpackFileExplorer } from "./sandpack-files/SandpackFileExplorer";
import { useStateRef } from "../../utils/useStateRef";
import {
  LiveShareSandboxApi,
  WindowMessagingApi,
} from "../../sandpack-templates";
import { useSandpackMessages } from "../../sandpack-hooks/useSandpackMessages";
import { useContainerEditable } from "../../live-share-hooks/fluid-helpers/useContainerEditable";
import { FlexColumn, FlexItem, FlexRow } from "../flex";

interface ISandpackLiveProps {
  template: "react" | "react-ts";
  codePagesMap: SharedMap | undefined;
  followModeState: EphemeralState<IFollowModeStateValue> | undefined;
  presence: EphemeralPresence | undefined;
  container: IFluidContainer | undefined;
  teamsContext: microsoftTeams.app.Context | undefined;
}

const SandpackLive: FC<ISandpackLiveProps> = (props) => {
  const {
    pages,
    files: codePageFiles,
    filesRef: codePageFilesRef,
    onAddPage,
    setFiles,
  } = useCodePages(props.codePagesMap, props.container);
  const { editableRef } = useContainerEditable(props.container);

  const { followingUserId, onInitiateFollowMode, onEndFollowMode } =
    useFollowModeState(props.followModeState, props.teamsContext?.user?.id);

  const {
    localUser,
    localUserIsEligiblePresenter,
    users,
    currentPageKey,
    onChangeCurrentPageKey,
  } = usePresence(
    props.presence,
    props.teamsContext,
    "/App.tsx",
    followingUserId
  );

  const [sandpackFiles, setSandpackFiles] = useState<any>({});
  const codemirrorInstance = useRef<any>();
  const activeFileRef = useRef<string | undefined>();
  const previousActiveFileRef = useRef<string | undefined>();

  const mappedSandpackFiles = useMemo(() => {
    const _files: any = {};
    Object.keys(sandpackFiles).forEach((key) => {
      _files[key] = {
        code: codePageFilesRef.current.get(key),
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
    console.log(_files);
    return _files;
  }, [sandpackFiles, currentPageKey]);

  const onApplyTemplateChange = useCallback(() => {
    const _files: any = {};
    let valueChanged = false;
    codePageFiles.forEach((value, key) => {
      _files[key] = value;
      if (sandpackFiles[key] !== value) {
        console.log(
          "template changed",
          key,
          "current page",
          activeFileRef.current
        );
        if (sandpackFiles[key] && key === activeFileRef.current) {
          // Getting CodeMirror instance
          const cmInstance = (
            codemirrorInstance.current as CodeMirrorRef | undefined
          )?.getCodemirror();
          if (!cmInstance) {
            console.log("cmInstance is undefined");
            return;
          }

          // Current position
          const currentPosition = cmInstance.state.selection.ranges[0].to;

          console.log(
            "cmInstance transaction from 0 to",
            cmInstance.state.doc.length
          );
          // Setting a new position
          const trans = cmInstance.state.update({
            selection: EditorSelection.cursor(currentPosition + 1),
            changes: {
              from: 0,
              to: cmInstance.state.doc.length,
              insert: value,
            },
          });

          cmInstance.update([trans]);
        } else {
          valueChanged = true;
        }
      }
    });
    if (valueChanged) {
      console.log("setting sandpack files");
      setSandpackFiles(_files);
    }
  }, [codePageFiles, sandpackFiles, setSandpackFiles]);

  useEffect(() => {
    if (codePageFiles.size > 1) {
      onApplyTemplateChange();
    }
  }, [onApplyTemplateChange, codePageFiles]);

  useEffect(() => {
    if (currentPageKey !== previousActiveFileRef.current) {
      previousActiveFileRef.current = currentPageKey;
      setFiles(codePageFilesRef.current);
    }
  }, [currentPageKey, codePageFiles]);

  if (codePageFiles.size < 2) {
    return null;
  }

  return (
    <>
      <FlexItem noShrink>
        <SandpackFileExplorer
          files={sandpackFiles}
          selectedFileKey={currentPageKey}
          onChangeSelectedFile={(fileName) => {
            onChangeCurrentPageKey(fileName);
            if (
              followingUserId &&
              followingUserId !== localUser?.userId &&
              localUserIsEligiblePresenter
            ) {
              onInitiateFollowMode();
            }
          }}
          followModeActive={!!followingUserId}
          onAddPage={onAddPage}
          onInitiateFollowMode={onInitiateFollowMode}
          onEndFollowMode={onEndFollowMode}
        />
      </FlexItem>
      <FlexColumn expand="fill" style={{ position: "relative" }}>
        <SandpackProvider
          // Try out the included templates below!
          template={props.template}
          files={mappedSandpackFiles}
          options={
            {
              // bundlerURL: "https://sandpack-bundler.pages.dev",
              // skipEval: true,
            }
          }
          customSetup={{
            dependencies: {
              "@microsoft/live-share": "~0.3.1",
              "@microsoft/live-share-media": "~0.3.1",
              "fluid-framework": "~0.59.3000",
              "@fluidframework/test-client-utils": "~0.59.3000",
              "@fluidframework/sequence": "~0.59.3000",
              react: "^18.0.0",
              "react-dom": "^18.0.0",
              "react-scripts": "^4.0.0",
            },
          }}
        >
          <SandpackThemeProvider theme={"dark"}>
            <SandpackLayout>
              <SandpackEditor
                pages={pages}
                codePageFiles={codePageFiles}
                codePageFilesRef={codePageFilesRef}
                activeFileRef={activeFileRef}
                codemirrorInstance={codemirrorInstance}
                editableRef={editableRef}
              />
              <SandpackPreview
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  height: "100%",
                  width: "50%",
                }}
              />
            </SandpackLayout>
          </SandpackThemeProvider>
        </SandpackProvider>
      </FlexColumn>
    </>
  );
};

export default SandpackLive;
