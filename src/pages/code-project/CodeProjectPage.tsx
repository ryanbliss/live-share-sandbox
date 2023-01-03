import { FC, memo } from "react";
import { CodeProject } from "../../components";
import { FluidObjectsProvider } from "../../context-providers";

export const CodeProjectPage: FC = memo(() => {
  return (
    <FluidObjectsProvider>
      <CodeProject />
    </FluidObjectsProvider>
  );
});
