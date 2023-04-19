import { useSandpack } from "@codesandbox/sandpack-react";
import { useEffect } from "react";

export const useSandpackIFramePermissions = () => {
  const { sandpack } = useSandpack();

  useEffect(() => {
    if (!sandpack) return;
    Object.values(sandpack.clients).forEach((client) => {
      if (client.iframe) {
        client.iframe.allow =
          "autoplay; accelerometer; ambient-light-sensor; battery; camera; display-capture; document-domain; encrypted-media; execution-while-not-rendered; execution-while-out-of-viewport; fullscreen; gamepad; geolocation; gyroscope; hid; identity-credentials-get; idle-detection; local-fonts; magnetometer; microphone; midi; payment; picture-in-picture; publickey-credentials-get; screen-wake-lock; serial; speaker-detection; usb; web-share; xr-spatial-tracking";
      }
    });
  }, [sandpack]);

  return;
};
