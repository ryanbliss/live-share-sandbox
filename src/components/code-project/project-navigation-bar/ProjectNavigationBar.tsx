import { Button } from "@fluentui/react-components";
import { FC } from "react";
import {
  ShareScreenStart24Filled,
  ShareScreenStop24Filled,
} from "@fluentui/react-icons";
import { useFluidObjectsContext } from "../../../context-providers";
import { NavigationBar } from "../../navigation-bar";

export const ProjectNavigationBar: FC = () => {
  const { followingUserId, onInitiateFollowMode, onEndFollowMode } =
    useFluidObjectsContext();

  const followModeActive = !!followingUserId;
  return (
    <NavigationBar
      isL1={false}
      rightActions={
        <>
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
        </>
      }
    />
  );
};
