import { FC } from "react";
import { useTeamsContext } from "../../hooks";
import { SandpackLive } from "../../components";
import { LiveShareProvider } from "../../context-providers";

export const MeetingStagePage: FC = () => {
  const teamsContext = useTeamsContext();
  return (
    <LiveShareProvider>
      <SandpackLive template={"react-ts"} teamsContext={teamsContext} />
    </LiveShareProvider>
  );
};
