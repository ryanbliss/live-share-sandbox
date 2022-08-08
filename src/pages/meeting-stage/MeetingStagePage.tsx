import { FC } from "react";
import { SandpackLive } from "../../components";
import {
  FluidObjectsProvider,
  LiveShareProvider,
} from "../../context-providers";

export const MeetingStagePage: FC = () => {
  // return (
  //   <LiveShareProvider>
  //     <FluidObjectsProvider>
  //       <SandpackLive template={"react-ts"} />
  //     </FluidObjectsProvider>
  //   </LiveShareProvider>
  // );
  return (
    <FluidObjectsProvider>
      <SandpackLive template={"react-ts"} />
    </FluidObjectsProvider>
  );
};
