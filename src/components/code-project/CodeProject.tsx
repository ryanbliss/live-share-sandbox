import { FC, useCallback, useState } from "react";
import { DocumentMultiple24Filled } from "@fluentui/react-icons";
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  SandpackThemeProvider,
} from "@codesandbox/sandpack-react";
import { FileExplorer } from "./file-explorer/FileExplorer";
import { FlexColumn, FlexItem, FlexRow } from "../flex";
import { MonacoEditor } from "./monaco-editor/MonacoEditor";
import {
  useFluidObjectsContext,
  useTeamsClientContext,
} from "../../context-providers";
import { useSandpackMessages } from "../../hooks";
import { useCodeboxLiveProjects } from "../../context-providers/codebox-live-provider/internals";
import { LanguageType } from "../../models";
import {
  SelectTabEventHandler,
  Tab,
  TabList,
  tokens,
} from "@fluentui/react-components";
import { ProjectNavigationBar } from "./project-navigation-bar/ProjectNavigationBar";
import { FrameContexts } from "@microsoft/teams-js";

enum LeftNavTabType {
  files = "Files",
}

function isLeftNavTabType(value: any): value is LeftNavTabType {
  return Object.values(LeftNavTabType).includes(value);
}

const LEFT_NAV_TABS = [
  {
    value: LeftNavTabType.files,
    icon: <DocumentMultiple24Filled />,
  },
];

export const CodeProject: FC = () => {
  const { teamsContext } = useTeamsClientContext();
  const isSidePanel =
    teamsContext?.page.frameContext === FrameContexts.sidePanel;
  const [isCodeActive, setCodeActive] = useState<boolean>(!isSidePanel);
  const [isPreviewActive, setPreviewActive] = useState(true);
  const [leftNavTabValue, setLeftNavTabValue] = useState<
    LeftNavTabType | undefined
  >(isSidePanel ? undefined : LeftNavTabType.files);
  const { codeFiles, mappedSandpackFiles } = useFluidObjectsContext();
  const { currentProject } = useCodeboxLiveProjects();
  // Setup Sandpack gateway hub
  useSandpackMessages();

  const onSelectLeftNavTab: SelectTabEventHandler = useCallback(
    (ev, data) => {
      if (isLeftNavTabType(data.value)) {
        if (data.value === leftNavTabValue) {
          setLeftNavTabValue(undefined);
        } else {
          setLeftNavTabValue(data.value);
        }
      }
    },
    [leftNavTabValue]
  );

  // If we haven't yet loaded the code files, show nothing
  if (codeFiles.size < 2 || !currentProject) {
    return null;
  }

  return (
    <>
      <FlexItem noShrink>
        <ProjectNavigationBar
          isLeftActive={isCodeActive}
          isRightActive={isPreviewActive}
          onToggleLeftActive={() => {
            setCodeActive(!isCodeActive);
          }}
          onToggleRightActive={() => {
            setPreviewActive(!isPreviewActive);
          }}
        />
      </FlexItem>
      <FlexRow expand="fill">
        <FlexColumn
          style={{
            height: "100%",
            borderRightStyle: "solid",
            borderRightColor: tokens.colorNeutralStroke1,
            borderRightWidth: "1px",
          }}
        >
          <TabList
            vertical
            selectedValue={leftNavTabValue}
            onTabSelect={onSelectLeftNavTab}
          >
            {LEFT_NAV_TABS.map((tabItem) => (
              <Tab
                key={`tab-${tabItem.value}`}
                value={tabItem.value}
                icon={tabItem.icon}
                title={tabItem.value}
              />
            ))}
          </TabList>
        </FlexColumn>
        {leftNavTabValue === LeftNavTabType.files && (
          <FlexColumn
            style={{
              height: "100%",
              width: "180px",
              borderRightStyle: "solid",
              borderRightColor: tokens.colorNeutralStroke1,
              borderRightWidth: "1px",
            }}
          >
            <FileExplorer />
          </FlexColumn>
        )}
        <FlexItem grow>
          <FlexRow expand="fill" style={{ position: "relative" }}>
            {/* SandpackProvider creates the sandbox and compiles the iFrame with the latest code */}
            <SandpackProvider files={mappedSandpackFiles}>
              <SandpackThemeProvider theme={"dark"}>
                <SandpackLayout>
                  {/* Custom MonacoEditor for viewing & editing the text of the code */}
                  <MonacoEditor
                    language={
                      currentProject.language === LanguageType.typescript
                        ? "typescript"
                        : "javascript"
                    }
                    theme="vs-dark"
                    editingEnabled={true}
                    style={{
                      position: "absolute",
                      right: isPreviewActive ? "50%" : 0,
                      left: 0,
                      top: 0,
                      bottom: 0,
                      height: "100%",
                      width: isPreviewActive ? "50%" : "100%",
                      visibility: isCodeActive ? "visible" : "hidden",
                    }}
                  />
                  {/* Preview viewer for the compiled application */}
                  <SandpackPreview
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: isCodeActive ? "50%" : 0,
                      height: "100%",
                      width: isCodeActive ? "50%" : "100%",
                      visibility: isPreviewActive ? "visible" : "hidden",
                    }}
                  />
                </SandpackLayout>
              </SandpackThemeProvider>
            </SandpackProvider>
          </FlexRow>
        </FlexItem>
      </FlexRow>
    </>
  );
};
