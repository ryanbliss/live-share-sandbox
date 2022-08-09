import { FC } from "react";
import { SandpackLive } from "../../components";
import {
  CodeboxLiveProvider,
  FluidObjectsProvider,
} from "../../context-providers";

export const CodeProjectPage: FC = () => {
  return (
    <CodeboxLiveProvider>
      <FluidObjectsProvider>
        <SandpackLive template={"react-ts"} />
      </FluidObjectsProvider>
    </CodeboxLiveProvider>
  );
};
