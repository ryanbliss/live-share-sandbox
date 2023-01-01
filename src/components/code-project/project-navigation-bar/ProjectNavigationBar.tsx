import { Button } from "@fluentui/react-components";
import { FC } from "react";
import {
  ShareScreenStart24Filled,
  ShareScreenStop24Filled,
} from "@fluentui/react-icons";
import {
  useCodeboxLiveContext,
  useFluidObjectsContext,
} from "../../../context-providers";
import { NavigationBar } from "../../navigation-bar";
import { ShareMenu } from "../../menus";

export const ProjectNavigationBar: FC = () => {
  const { followingUserId, onInitiateFollowMode, onEndFollowMode } =
    useFluidObjectsContext();
  const { currentProject } = useCodeboxLiveContext();

  const followModeActive = !!followingUserId;
  return (
    <NavigationBar
      isL1={false}
      rightActions={
        <>
          {currentProject && (
            <ShareMenu
              url={`${window.location.origin}/projects/${currentProject._id}`}
            />
          )}
          {followModeActive && (
            <Button
              icon={<ShareScreenStop24Filled />}
              appearance="subtle"
              title={"Stop follow mode"}
              onClick={onEndFollowMode}
            />
          )}
          {!followModeActive && (
            <Button
              icon={<ShareScreenStart24Filled />}
              appearance="subtle"
              title={"Start follow mode"}
              onClick={onInitiateFollowMode}
            />
          )}
        </>
      }
    />
  );
};
