import { Tab, TabList } from "@fluentui/react-components";
import { FC, useMemo } from "react";
import { FlexColumn, FlexItem, FlexRow } from "../../flex";
import { TextInputPopover } from "../../text-input-popover/text-input-popover";

interface ISandpackFileExplorerProps {
  files: any;
  selectedFileKey: string;
  onChangeSelectedFile: (fileName: string) => void;
  onAddPage: (pageName: string) => void;
}

export const SandpackFileExplorer: FC<ISandpackFileExplorerProps> = ({
  files,
  selectedFileKey,
  onChangeSelectedFile,
  onAddPage,
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
            <Tab value={fileName}>{fileName.substring(1)}</Tab>
          ))}
        </TabList>
      </FlexColumn>
      <TextInputPopover title="File name" onDone={onAddPage} />
    </FlexRow>
  );
};
