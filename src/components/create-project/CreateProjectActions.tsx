import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from "@fluentui/react-components";
import { MoreVertical20Regular } from "@fluentui/react-icons";
import { FC, useState } from "react";
import { FlexRow } from "../flex";
import {
  getCreateProjectFullButtonsStyles,
  getCreateProjectMenuStyles,
} from "./CreateProjectActions-styles";
import { CreateProjectViaGitDialog } from "./CreateProjectViaGitDIalog";
import { CreateProjectViaTemplateDialog } from "./CreateProjectViaTemplateDialog";

export const CreateProjectActions: FC = () => {
  const [templateOpen, setTemplateOpen] = useState(false);
  const [gitOpen, setGitOpen] = useState(false);
  const { root: buttonsStyle } = getCreateProjectFullButtonsStyles();
  const { root: menuStyle } = getCreateProjectMenuStyles();
  return (
    <FlexRow>
      <CreateProjectViaGitDialog open={gitOpen} setOpen={setGitOpen} />
      <CreateProjectViaTemplateDialog
        open={templateOpen}
        setOpen={setTemplateOpen}
      />
      <FlexRow marginSpacer="small" className={buttonsStyle}>
        <Button
          appearance="secondary"
          size="medium"
          onClick={() => {
            setGitOpen(true);
          }}
        >
          {"Git clone"}
        </Button>
        <Button
          appearance="primary"
          size="medium"
          onClick={() => {
            setTemplateOpen(true);
          }}
        >
          {"New project"}
        </Button>
      </FlexRow>
      <FlexRow className={menuStyle}>
        <Menu positioning={"below-end"}>
          <MenuTrigger>
            <Button appearance="subtle" icon={<MoreVertical20Regular />} />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem
                onClick={() => {
                  setTemplateOpen(true);
                }}
              >
                {"New project"}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setGitOpen(true);
                }}
              >
                {"Git clone"}
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </FlexRow>
    </FlexRow>
  );
};
