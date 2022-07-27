import { FC } from "react";
import { useTeamsContext } from "../../hooks";
import { SandpackLive } from "../../components";
import { FluidObjectsProvider } from "../../context-providers";

export const MeetingStagePage: FC = () => {
  const teamsContext = useTeamsContext();
  return (
    <FluidObjectsProvider>
      <SandpackLive template={"react-ts"} />
    </FluidObjectsProvider>
  );
};
