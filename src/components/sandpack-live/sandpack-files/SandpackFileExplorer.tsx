import { Button, Tab, TabList } from "@fluentui/react-components";
import { FC, useMemo } from "react";
import { FlexColumn, FlexItem, FlexRow } from "../../flex";
import { TextInputPopover } from "../../text-input-popover/text-input-popover";
import {
  ShareScreenStart24Filled,
  ShareScreenStop24Filled,
} from "@fluentui/react-icons";
import { SandpackFiles } from "@codesandbox/sandpack-react";

interface ISandpackFileExplorerProps {
  files: SandpackFiles;
  selectedFileKey: string;
  followModeActive: boolean;
  onChangeSelectedFile: (fileName: string) => void;
  onAddPage: (pageName: string) => void;
  onInitiateFollowMode: () => void;
  onEndFollowMode: () => void;
}

export const SandpackFileExplorer: FC<ISandpackFileExplorerProps> = ({
  files,
  selectedFileKey,
  followModeActive,
  onChangeSelectedFile,
  onAddPage,
  onInitiateFollowMode,
  onEndFollowMode,
}) => {
  const fileNames = Object.keys(files);
  return (
    <FlexRow
      expand="horizontal"
      spaceBetween
      marginSpacer="small"
      vAlign="center"
      hAlign="start"
    >
      <FlexColumn hAlign="start">
        <TabList
          selectedValue={selectedFileKey}
          onTabSelect={(event, data) => {
            onChangeSelectedFile(data.value as string);
          }}
        >
          {fileNames.map((fileName) => (
            <Tab value={fileName} key={`${fileName}-tab-key`}>
              {fileName.substring(1)}
            </Tab>
          ))}
        </TabList>
      </FlexColumn>
      <FlexRow vAlign="start">
        {followModeActive && (
          <Button
            icon={<ShareScreenStop24Filled />}
            appearance="subtle"
            onClick={onEndFollowMode}
          />
        )}
        {!followModeActive && (
          <Button
            icon={<ShareScreenStart24Filled />}
            appearance="subtle"
            onClick={onInitiateFollowMode}
          />
        )}
        <TextInputPopover title="File name" onDone={onAddPage} />
      </FlexRow>
    </FlexRow>
  );
};
