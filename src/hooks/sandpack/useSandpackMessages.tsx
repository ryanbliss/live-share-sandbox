import { UncleGatewayHub } from "@codeboxlive/uncle";
import { useEffect, useRef } from "react";
import { useTeamsClientContext } from "../../context-providers";
import { FluidService } from "../../service/FluidService";

export const useSandpackMessages = () => {
  const fluidServiceRef = useRef<FluidService>();
  const { teamsContext } = useTeamsClientContext();

  useEffect(() => {
    if (fluidServiceRef.current || !teamsContext?.user?.id) {
      return;
    }
    // Set up hub
    fluidServiceRef.current = new FluidService(teamsContext.user!.id);
    UncleGatewayHub.initialize(fluidServiceRef.current!.toFluidRequests());
  });

  return;
};
