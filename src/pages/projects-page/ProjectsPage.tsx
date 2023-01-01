import { meeting, FrameContexts } from "@microsoft/teams-js";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { inTeams } from "../../utils/inTeams";
import { LoadableWrapper, FlexColumn, FlexItem } from "../../components";
import { useTeamsClientContext } from "../../context-providers";
import { ProjectList } from "../../components/project-list/ProjectList";
import { IProject } from "../../models";
import { HomeNavigationBar } from "../../components/navigation-bar/HomeNavigationBar";

export const ProjectsPage = () => {
  const [error, setError] = useState<Error | undefined>(undefined);
  const navigate = useNavigate();
  const { teamsContext } = useTeamsClientContext();

  const shareAppContentToStage = useCallback(
    (projectId: string) => {
      if (inTeams()) {
        meeting.shareAppContentToStage((error) => {
          if (error) {
            setError(new Error(error.message));
          }
        }, `${window.location.origin}/projects/${projectId}?inTeams=true`);
      } else {
        navigate({
          pathname: `/projects/${projectId}?inTeams=${inTeams()}`,
        });
      }
    },
    [navigate, setError]
  );

  return (
    <LoadableWrapper loading={false} error={error}>
      <FlexColumn expand="fill" vAlign="center" marginSpacer="small">
        <FlexItem noShrink>
          <HomeNavigationBar />
        </FlexItem>
        <ProjectList
          onSelectProject={(project: IProject) => {
            if (teamsContext?.page?.frameContext === FrameContexts.sidePanel) {
              shareAppContentToStage(project._id);
            } else {
              navigate({
                pathname: `/projects/${project._id}`,
              });
            }
          }}
        />
      </FlexColumn>
    </LoadableWrapper>
  );
};
