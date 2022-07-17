import { SandpackState, useSandpack } from "@codesandbox/sandpack-react";
import { useEffect, useRef } from "react";

export const useSandpackMessages = () => {
  const { sandpack } = useSandpack();
  const sandpackRef = useRef<SandpackState | undefined>();
  const registeredListenerRef = useRef<boolean>(false);

  useEffect(() => {
    if (registeredListenerRef.current) {
      return;
    }
    registeredListenerRef.current = true;
    window.addEventListener("message", function (e) {
      const data = e.data;
      try {
        const decoded = JSON.parse(data);
        if (decoded?.messageType === "getContainerId" && decoded?.messageId) {
          if (!sandpackRef.current) {
            return;
          }
          console.log({
            messageType: "getContainerId",
            messageId: decoded?.messageId,
            response: window.location.hash?.substring(1) ?? undefined,
          });
          const message = JSON.stringify({
            messageType: "getContainerId",
            messageId: decoded?.messageId,
            response: window.location.hash?.substring(1) ?? undefined,
          });

          Object.values(sandpackRef.current.clients).forEach((client) => {
            client.iframe.contentWindow?.postMessage(message, "*");
          });
        }
      } catch {
        (error: Error) => {
          console.error(error);
        };
      }
    });
  });

  useEffect(() => {
    sandpackRef.current = sandpack;
  }, [sandpack]);

  return;
};
