import { Button, Tab, TabList } from "@fluentui/react-components";
import { FC } from "react";
import { FlexColumn, FlexRow } from "../../../flex";
import { TextInputPopover } from "../../../popovers";
import {
  ShareScreenStart24Filled,
  ShareScreenStop24Filled,
} from "@fluentui/react-icons";

interface ISandpackFileExplorerProps {
  fileNames: string[];
  selectedFileKey: string;
  followModeActive: boolean;
  onChangeSelectedFile: (fileName: string) => void;
  onAddPage: (pageName: string) => void;
  onInitiateFollowMode: () => void;
  onEndFollowMode: () => void;
}

export const SandpackFileExplorer: FC<ISandpackFileExplorerProps> = ({
  fileNames,
  selectedFileKey,
  followModeActive,
  onChangeSelectedFile,
  onAddPage,
  onInitiateFollowMode,
  onEndFollowMode,
}) => {
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
