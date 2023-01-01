import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from "@fluentui/react-components";
import {
  MoreHorizontal20Regular,
  Delete20Regular,
} from "@fluentui/react-icons";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCodeboxLiveContext } from "../../context-providers";
import { IProject } from "../../models";
import { inTeams } from "../../utils";

interface IProjectOverflowMenuProps {
  project: IProject;
  redirectOnDelete?: boolean;
}

export const ProjectOverflowMenu: FC<IProjectOverflowMenuProps> = ({
  project,
  redirectOnDelete,
}) => {
  const { deleteProject } = useCodeboxLiveContext();
  const navigate = useNavigate();

  const onDelete = useCallback(async () => {
    if (redirectOnDelete) {
      navigate(`/projects?inTeams=${inTeams()}`);
    }
    try {
      await deleteProject(project);
    } catch (error: any) {
      console.error(error);
    }
  }, [project, redirectOnDelete, deleteProject, location, navigate]);
  return (
    <Menu>
      <MenuTrigger>
        <Button
          appearance="subtle"
          icon={<MoreHorizontal20Regular />}
          title="More"
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem icon={<Delete20Regular />} onClick={onDelete}>
            {"Delete project"}
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};
