import { UncleGatewayHub } from "@codeboxlive/uncle";
import { useEffect, useRef } from "react";
import {
  useCodeboxLiveContext,
  useTeamsClientContext,
} from "../../context-providers";
import { ProjectsService } from "../../service";
import { FluidService } from "../../service/FluidService";
import { useSandpack } from "@codesandbox/sandpack-react";

export const useSandpackMessages = () => {
  const fluidServiceRef = useRef<FluidService>();
  const { teamsContext } = useTeamsClientContext();
  const { currentProject } = useCodeboxLiveContext();
  const { sandpack } = useSandpack();

  useEffect(() => {
    async function start() {
      if (!teamsContext?.user?.id || !currentProject) {
        return;
      }
      // Set up hub
      if (!fluidServiceRef.current) {
        const projectService = new ProjectsService();
        await projectService.authorize(teamsContext!.user!.id);
        fluidServiceRef.current = new FluidService(
          teamsContext!.user!.id,
          currentProject!,
          projectService
        );
      }
      console.log("useSandpackMessages: registering gateway");
      await UncleGatewayHub.initialize(
        fluidServiceRef.current!.toFluidRequests()
      );
    }
    start();
  }, [currentProject, teamsContext]);

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
