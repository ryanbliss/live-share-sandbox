import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from "@fluentui/react-components";
import { MoreHorizontal20Filled, Delete20Regular } from "@fluentui/react-icons";
import { FC } from "react";
import { useCodeboxLiveContext } from "../../context-providers";
import { IProject } from "../../models";

interface IProjectOverflowMenuProps {
  project: IProject;
}

export const ProjectOverflowMenu: FC<IProjectOverflowMenuProps> = ({
  project,
}) => {
  const { deleteProject } = useCodeboxLiveContext();
  return (
    <Menu>
      <MenuTrigger>
        <Button
          appearance="subtle"
          icon={<MoreHorizontal20Filled />}
          title="More"
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem
            icon={<Delete20Regular />}
            onClick={() => {
              deleteProject(project);
            }}
          >
            {"Delete project"}
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};
