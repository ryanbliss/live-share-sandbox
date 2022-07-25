import { SandpackState, useSandpack } from "@codesandbox/sandpack-react";
import { MutableRefObject, useEffect, useRef } from "react";
import { inTeams } from "../utils/inTeams";

export const useSandpackMessages = (
  userDidCreateContainerRef: MutableRefObject<boolean> | undefined
) => {
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
        if (!sandpackRef.current || !decoded?.messageId) {
          if (inTeams()) {
            console.log(
              "useSandpackMessages decoded message received",
              decoded
            );
          }
          return;
        } else if (inTeams()) {
          console.log("useSandpackMessages decoded message received", decoded);
        }
        let messageResponse: any;
        if (decoded?.messageType === "getContainerId") {
          messageResponse = window.location.hash?.substring(1) ?? undefined;
        } else if (decoded?.messageType === "getShouldCreateInitialObjects") {
          let shouldCreateInitialObjects: boolean = true;
          if (inTeams()) {
            // TODO: replace with isPresentingUser
            shouldCreateInitialObjects = !!userDidCreateContainerRef?.current;
          } else {
            shouldCreateInitialObjects = !!userDidCreateContainerRef?.current;
          }
          messageResponse = shouldCreateInitialObjects;
        }
        let message: string;
        if (messageResponse !== undefined) {
          message = JSON.stringify({
            messageType: decoded!.messageType,
            messageId: decoded?.messageId,
            response: messageResponse,
          });
        } else {
          message = JSON.stringify({
            messageType: decoded!.messageType,
            messageId: decoded!.messageId,
            errorMessage: "Unable to find a response",
          });
        }
        console.log(message);
        Object.values(sandpackRef.current.clients).forEach((client) => {
          client.iframe.contentWindow?.postMessage(message, "*");
        });
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
