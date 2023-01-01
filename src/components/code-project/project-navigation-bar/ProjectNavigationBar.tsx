import { Button, tokens } from "@fluentui/react-components";
import { FC } from "react";
import {
  ShareScreenStart20Regular,
  ShareScreenStop20Regular,
  PanelLeft20Filled,
  PanelRight20Filled,
} from "@fluentui/react-icons";
import {
  useCodeboxLiveContext,
  useFluidObjectsContext,
} from "../../../context-providers";
import { NavigationBar } from "../../navigation-bar";
import { ShareMenu } from "../../menus";
import { FlexRow } from "../../flex";
import { ProjectOverflowMenu } from "../../menus/ProjectOverflowMenu";

interface IProjectNavigationBarProps {
  isLeftActive: boolean;
  isRightActive: boolean;
  onToggleLeftActive: () => void;
  onToggleRightActive: () => void;
}

export const ProjectNavigationBar: FC<IProjectNavigationBarProps> = ({
  isLeftActive,
  isRightActive,
  onToggleLeftActive,
  onToggleRightActive,
}) => {
  const { followingUserId, onInitiateFollowMode, onEndFollowMode } =
    useFluidObjectsContext();
  const { currentProject } = useCodeboxLiveContext();

  const followModeActive = !!followingUserId;
  return (
    <NavigationBar
      isL1={false}
      rightActions={
        <FlexRow marginSpacer="medium">
          <FlexRow marginSpacer="smaller">
            <Button
              appearance="subtle"
              icon={<PanelLeft20Filled />}
              style={{
                color: isLeftActive
                  ? tokens.colorBrandForeground1
                  : tokens.colorNeutralForeground3,
              }}
              onClick={onToggleLeftActive}
            />
            <Button
              appearance="subtle"
              icon={<PanelRight20Filled />}
              style={{
                color: isRightActive
                  ? tokens.colorBrandForeground1
                  : tokens.colorNeutralForeground3,
              }}
              onClick={onToggleRightActive}
            />
          </FlexRow>
          <FlexRow marginSpacer="smaller" vAlign="center">
            {currentProject && <ShareMenu project={currentProject} />}
            {followModeActive && (
              <Button
                icon={<ShareScreenStop20Regular />}
                appearance="subtle"
                title={"Stop follow mode"}
                onClick={onEndFollowMode}
              />
            )}
            {!followModeActive && (
              <Button
                icon={<ShareScreenStart20Regular />}
                appearance="subtle"
                title={"Start follow mode"}
                onClick={onInitiateFollowMode}
              />
            )}
            {currentProject && (
              <ProjectOverflowMenu project={currentProject} redirectOnDelete />
            )}
          </FlexRow>
        </FlexRow>
      }
    />
  );
};
