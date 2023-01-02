import { FrameContexts } from "@microsoft/teams-js";
import { FlexColumn, FlexItem } from "../../components";
import { useTeamsClientContext } from "../../context-providers";
import { ProjectList } from "../../components/project-list/ProjectList";
import { HomeNavigationBar } from "../../components/navigation-bar/HomeNavigationBar";

export const ProjectsPage = () => {
  const { teamsContext } = useTeamsClientContext();

  const isSidePanel =
    teamsContext?.page.frameContext === FrameContexts.sidePanel;

  return (
    <FlexColumn expand="fill" vAlign="center" marginSpacer="small">
      {!isSidePanel && (
        <FlexItem noShrink>
          <HomeNavigationBar />
        </FlexItem>
      )}
      <ProjectList />
    </FlexColumn>
  );
};
