import { FC } from "react";
import { CodeProject, FlexItem } from "../../components";
import { ProjectNavigationBar } from "../../components/code-project/project-navigation-bar/ProjectNavigationBar";
import { FluidObjectsProvider } from "../../context-providers";

export const CodeProjectPage: FC = () => {
  return (
    <FluidObjectsProvider>
      <FlexItem noShrink>
        {/* SandpackFileExplorer allows the user to select new files */}
        <ProjectNavigationBar />
      </FlexItem>
      <CodeProject />
    </FluidObjectsProvider>
  );
};
