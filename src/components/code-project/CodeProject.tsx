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
import { useFluidObjectsContext } from "../../context-providers";
import { useSandpackMessages } from "../../hooks";
import { useCodeboxLiveProjects } from "../../context-providers/codebox-live-provider/internals";
import { LanguageType } from "../../models";
import {
  SelectTabEventHandler,
  Tab,
  TabList,
  tokens,
} from "@fluentui/react-components";

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
  const [leftNavTabValue, setLeftNavTabValue] = useState<
    LeftNavTabType | undefined
  >(LeftNavTabType.files);
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
                      right: "50%",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      height: "100%",
                      width: "50%",
                    }}
                  />
                  {/* Preview viewer for the compiled application */}
                  <SandpackPreview
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: "50%",
                      height: "100%",
                      width: "50%",
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
