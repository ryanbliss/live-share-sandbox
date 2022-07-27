import { SandpackState, useSandpack } from "@codesandbox/sandpack-react";
import { useEffect, useRef } from "react";
import { useFluidObjectsContext } from "../../context-providers";
import { inTeams } from "../../utils/inTeams";

export const useSandpackMessages = () => {
  const { userDidCreateContainerRef } = useFluidObjectsContext();
  const { sandpack } = useSandpack();
  const sandpackRef = useRef<SandpackState | undefined>();
  const registeredListenerRef = useRef<boolean>(false);

  useEffect(() => {
    if (registeredListenerRef.current) {
      return;
    }
    registeredListenerRef.current = true;
    window.addEventListener("message", (e) => {
      const data = e.data;
      try {
        const decoded = JSON.parse(data);
        if (!sandpackRef.current || !decoded?.messageId) {
          return;
        }
        let messageResponse: any;
        let errorMessage: string | undefined;
        if (decoded?.messageType === "getContainerId") {
          if (inTeams()) {
            errorMessage = "getContainerId is not supported inside of Teams";
          } else {
            // Return the test containerId in the hash of our URL
            messageResponse = window.location.hash?.substring(1) ?? undefined;
          }
        } else if (decoded?.messageType === "getShouldCreateInitialObjects") {
          let shouldCreateInitialObjects: boolean;
          if (inTeams()) {
            // TODO: replace with isPresentingUser because in meetings multiple
            // users may think they created the container
            shouldCreateInitialObjects = !!userDidCreateContainerRef?.current;
          } else {
            // This is important, because it means that we need to let the sandbox
            // load once before refreshing the page when testing locally.
            shouldCreateInitialObjects = !!userDidCreateContainerRef?.current;
          }
          messageResponse = shouldCreateInitialObjects;
        } else {
          errorMessage = `useSandpackMessages: unhandled response type of ${decoded?.messageType}`;
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
            errorMessage: errorMessage || "Unable to find a response",
          });
        }
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
