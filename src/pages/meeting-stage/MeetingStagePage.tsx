import { FC } from "react";
import { useTeamsContext } from "../../hooks";
import { LiveShareProvider, SandpackLive } from "../../components";

export const MeetingStagePage: FC = () => {
  const teamsContext = useTeamsContext();
  return (
    <LiveShareProvider>
      <SandpackLive template={"react-ts"} teamsContext={teamsContext} />
    </LiveShareProvider>
  );
};
