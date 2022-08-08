import { FC } from "react";
import { SandpackLive } from "../../components";
import {
  CodeboxLiveProvider,
  FluidObjectsProvider,
  LiveShareProvider,
} from "../../context-providers";

export const MeetingStagePage: FC = () => {
  return (
    <CodeboxLiveProvider>
      <LiveShareProvider>
        <FluidObjectsProvider>
          <SandpackLive template={"react-ts"} />
        </FluidObjectsProvider>
      </LiveShareProvider>
    </CodeboxLiveProvider>
  );
};
