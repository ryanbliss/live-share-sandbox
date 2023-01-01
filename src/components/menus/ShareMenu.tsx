import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from "@fluentui/react-components";
import {
  Share24Filled,
  ShareScreenStart20Regular,
  Clipboard20Regular,
  Chat20Regular,
} from "@fluentui/react-icons";
import { FrameContexts } from "@microsoft/teams-js";
import { FC, useCallback } from "react";
import { useTeamsClientContext } from "../../context-providers";
import { IProject } from "../../models";
import { inTeams, shareToMeetingViaDeepLink, shareToTeams } from "../../utils";

interface IShareMenuProps {
  project: IProject;
}

export const ShareMenu: FC<IShareMenuProps> = ({ project }) => {
  const { teamsContext } = useTeamsClientContext();
  const onCopyLink = useCallback(async () => {
    const url = `${window.location.origin}/projects/${project._id}`;
    if (navigator.clipboard) {
      // For older browsers (including T1), this is used instead, but won't work in newer browsers that have deprecated execCommand
      const legacyBrowserCopyToClipboard = () => {
        try {
          const el = document.createElement("textarea");
          el.value = url;
          document.body.appendChild(el);
          el.select();
          document.execCommand("copy");
          document.body.removeChild(el);
        } catch (error: any) {
          console.log(error);
          // TODO: display error
        }
      };
      try {
        // Not all browsers support this, so we wrap in try/catch
        await navigator.clipboard.writeText(url);
      } catch (error: any) {
        legacyBrowserCopyToClipboard();
      }
    }
  }, [project]);

  const onShareToMeeting = useCallback(async () => {
    try {
      const appSharingUrl = `${window.location.origin}/projects/${project._id}?inTeams=true`;
      await shareToMeetingViaDeepLink(appSharingUrl);
    } catch (error: any) {
      console.error(error);
    }
  }, [project]);

  const onShareToTeams = useCallback(async () => {
    const appSharingUrl = `${window.location.origin}/projects/${project._id}`;
    try {
      await shareToTeams(
        appSharingUrl,
        `Check out my Codebox Live project: ${project.title}`
      );
    } catch (error: any) {
      console.error(error);
    }
  }, [project]);

  const isInTeams = inTeams();

  return (
    <Menu>
      <MenuTrigger>
        <Button appearance="subtle" icon={<Share24Filled />} title="Share" />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem icon={<Clipboard20Regular />} onClick={onCopyLink}>
            {"Copy share link"}
          </MenuItem>
          {teamsContext &&
            ![FrameContexts.sidePanel, FrameContexts.meetingStage].includes(
              teamsContext.page.frameContext
            ) && (
              <MenuItem
                icon={<ShareScreenStart20Regular />}
                onClick={onShareToMeeting}
              >
                {"Share in meeting"}
              </MenuItem>
            )}
          {isInTeams &&
            teamsContext &&
            ![FrameContexts.sidePanel, FrameContexts.meetingStage].includes(
              teamsContext.page.frameContext
            ) && (
              <MenuItem icon={<Chat20Regular />} onClick={onShareToTeams}>
                {"Share to Teams"}
              </MenuItem>
            )}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};
