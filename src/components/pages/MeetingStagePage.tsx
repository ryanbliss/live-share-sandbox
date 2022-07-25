import { FC } from "react";
import { useTeamsContext } from "../../teams-js-hooks/useTeamsContext";
import { LiveShareProvider } from "../context-providers/LiveShareProvider";
import SandpackLive from "../sandpack-live/SandpackLive";

export const MeetingStagePage: FC = () => {
  const teamsContext = useTeamsContext();
  return (
    <LiveShareProvider>
      <SandpackLive template={"react-ts"} teamsContext={teamsContext} />
    </LiveShareProvider>
  );
};
