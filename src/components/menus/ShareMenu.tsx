import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from "@fluentui/react-components";
import { Share24Filled } from "@fluentui/react-icons";
import { FC, useCallback } from "react";

interface IShareMenuProps {
  url: string;
}

export const ShareMenu: FC<IShareMenuProps> = ({ url }) => {
  const onCopyLink = useCallback(async () => {
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
  }, [url]);
  return (
    <Menu>
      <MenuTrigger>
        <Button appearance="subtle" icon={<Share24Filled />} title="Share" />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem onClick={onCopyLink}>{"Copy share link"}</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};
