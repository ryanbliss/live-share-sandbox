import { Button, Tab, TabList } from "@fluentui/react-components";
import { FC } from "react";
import { FlexColumn, FlexRow } from "../../../flex";
import { TextInputPopover } from "../../../popovers";
import {
  ShareScreenStart24Filled,
  ShareScreenStop24Filled,
} from "@fluentui/react-icons";
import {
  useFluidObjectsContext,
  useLiveShareContext,
} from "../../../../context-providers";

export const SandpackFileExplorer: FC = () => {
  const { currentPageKey, codeFiles, onAddPage, onChangeSelectedFile } =
    useFluidObjectsContext();
  const { followingUserId, onInitiateFollowMode, onEndFollowMode } =
    useLiveShareContext();
  const fileNames = [...codeFiles.keys()];
  const followModeActive = !!followingUserId;
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
          selectedValue={currentPageKey || "App.tsx"}
          onTabSelect={(event, data) => {
            onChangeSelectedFile?.(data.value as string);
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
