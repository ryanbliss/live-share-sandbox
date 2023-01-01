import { FC } from "react";
import { CodeProject } from "../../components";
import { FluidObjectsProvider } from "../../context-providers";

export const CodeProjectPage: FC = () => {
  return (
    <FluidObjectsProvider>
      <CodeProject />
    </FluidObjectsProvider>
  );
};
