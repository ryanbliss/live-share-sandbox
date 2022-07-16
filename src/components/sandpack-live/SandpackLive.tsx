import { FC, useCallback, useEffect, useMemo, useRef } from "react";
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
  BabelRC,
  ESLintRC,
  IndexDTS,
  LiveShareSandboxApi,
  PackageJson,
  PrettierRC,
  ReactIndexCSS,
  ReactIndexJs,
  ReactIntexHTML,
  TSConfigJSON,
  WebpackCommonConfig,
  WebpackDevConfig,
  WebpackProdConfig,
} from "../../sandpack-templates";

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
    "/App.js",
    followingUserId
  );

  const [sandpackFiles, sandpackFilesRef, setSandpackFiles] = useStateRef<any>(
    {}
  );
  const codemirrorInstance = useRef<any>();
  const activeFileRef = useRef<string | undefined>();
  const previousActiveFileRef = useRef<string | undefined>();

  const mappedSandpackFiles = useMemo(() => {
    const _files: any = {};
    Object.keys(sandpackFiles).forEach((key) => {
      _files[key] = {
        code: sandpackFiles[key],
        hidden: false,
        active: key === currentPageKey,
        readOnly: false,
      };
    });
    _files["/index.js"] = {
      code: ReactIndexJs,
      hidden: true,
      active: "/index.js" === currentPageKey,
      readOnly: true,
    };
    _files["/public/index.html"] = {
      code: ReactIntexHTML,
      hidden: true,
      active: "/public/index.html" === currentPageKey,
      readOnly: true,
    };
    _files["/styles.css"] = {
      code: ReactIndexCSS,
      hidden: true,
      active: "/styles.css" === currentPageKey,
      readOnly: true,
    };
    _files["/package.json"] = {
      code: PackageJson,
      hidden: false,
      active: "/package.json" === currentPageKey,
      readOnly: false,
    };
    // _files["/LiveShareSandboxApi.js"] = {
    //   code: LiveShareSandboxApi,
    //   hidden: true,
    //   active: false,
    //   readOnly: true,
    // };

    _files["/webpack.common.js"] = {
      code: WebpackCommonConfig,
      hidden: false,
      active: "/webpack.common.js" === currentPageKey,
      readOnly: false,
    };
    _files["/webpack.dev.js"] = {
      code: WebpackDevConfig,
      hidden: false,
      active: "/webpack.dev.js" === currentPageKey,
      readOnly: false,
    };
    _files["/webpack.prod.js"] = {
      code: WebpackProdConfig,
      hidden: false,
      active: "/webpack.prod.js" === currentPageKey,
      readOnly: false,
    };
    _files["/.babelrc"] = {
      code: BabelRC,
      hidden: false,
      active: "/.babelrc" === currentPageKey,
      readOnly: false,
    };
    _files["/.eslint.js"] = {
      code: ESLintRC,
      hidden: false,
      active: "/.eslint.js" === currentPageKey,
      readOnly: false,
    };
    _files["/.prettierrc.js"] = {
      code: PrettierRC,
      hidden: false,
      active: "/.prettierrc.js" === currentPageKey,
      readOnly: false,
    };
    _files["/tsconfig.json"] = {
      code: TSConfigJSON,
      hidden: false,
      active: "/tsconfig.json" === currentPageKey,
      readOnly: false,
    };
    _files["/index.d.ts"] = {
      code: IndexDTS,
      hidden: false,
      active: "/tsconfig.json" === currentPageKey,
      readOnly: false,
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
        }
        valueChanged = true;
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
    <div>
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
      <SandpackProvider
        // Try out the included templates below!
        // template={props.template}
        files={mappedSandpackFiles}
        options={
          {
            // bundlerURL: "https://sandpack-bundler.pages.dev",
            // skipEval: true,
          }
        }
        // customSetup={{
        //   dependencies: {
        //     "@microsoft/live-share-media": "0.3.1",
        //     "fluid-framework": "0.59.3003",
        //     "@fluidframework/test-client-utils": "0.59.2003",
        //     react: "^18.0.0",
        //     "react-dom": "^18.0.0",
        //     "react-scripts": "^4.0.0",
        //   },
        // }}
      >
        <SandpackThemeProvider theme={"dark"} style={{ height: "100vh" }}>
          <SandpackLayout>
            <SandpackEditor
              pages={pages}
              codePageFiles={codePageFiles}
              codePageFilesRef={codePageFilesRef}
              activeFileRef={activeFileRef}
              codemirrorInstance={codemirrorInstance}
            />
            <SandpackPreview style={{ height: "100vh" }} />
          </SandpackLayout>
        </SandpackThemeProvider>
      </SandpackProvider>
    </div>
  );
};

export default SandpackLive;
