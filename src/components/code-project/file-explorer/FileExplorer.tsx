import { Tab, TabList, Text } from "@fluentui/react-components";
import { FC } from "react";
import { FlexRow } from "../../flex";
import { TextInputPopover } from "../../popovers";
import {
  useCodeboxLiveContext,
  useFluidObjectsContext,
} from "../../../context-providers";
import { ScrollWrapper } from "../../scroll-wrapper";
import { getTextClampStyles } from "../../../styles/getTextStyles";

export const FileExplorer: FC = () => {
  const { currentPageKey, codeFiles, onAddPage, onChangeSelectedFile } =
    useFluidObjectsContext();
  const { currentProject } = useCodeboxLiveContext();
  const fileNames = [...codeFiles.keys()];
  const { root: textClampStyle } = getTextClampStyles();
  return (
    <ScrollWrapper>
      <FlexRow spaceBetween vAlign="center" style={{ padding: "4px 8px" }}>
        <Text
          weight="semibold"
          className={textClampStyle}
          title={currentProject?.title.toUpperCase()}
        >
          {currentProject?.title.toUpperCase()}
        </Text>
        <TextInputPopover title="File name" onDone={onAddPage} />
      </FlexRow>
      <TabList
        vertical
        selectedValue={currentPageKey || "App.tsx"}
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
    </ScrollWrapper>
  );
};
