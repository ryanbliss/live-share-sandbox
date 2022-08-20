import { meeting, FrameContexts } from "@microsoft/teams-js";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { inTeams } from "../../utils/inTeams";
import { LoadableWrapper, FlexColumn } from "../../components";
import {
  CodeboxLiveProvider,
  useTeamsClientContext,
} from "../../context-providers";
import { ProjectList } from "../../components/project-list/ProjectList";
import { IProject } from "../../models";

export const SidePanelPage = () => {
  const [error, setError] = useState<Error | undefined>(undefined);
  const navigate = useNavigate();
  const { teamsContext } = useTeamsClientContext();

  const shareAppContentToStage = useCallback(
    (containerId: string) => {
      if (inTeams()) {
        meeting.shareAppContentToStage((error) => {
          if (error) {
            setError(new Error(error.message));
          }
        }, `${window.location.origin}/meeting/projects/${containerId}?inTeams=true`);
      } else {
        navigate({
          pathname: `/meeting/projects/${containerId}?inTeams=${inTeams()}`,
        });
      }
    },
    [navigate, setError]
  );

  return (
    <CodeboxLiveProvider>
      <LoadableWrapper loading={false} error={error}>
        <FlexColumn expand="fill" vAlign="center" marginSpacer="small">
          <ProjectList
            selectText="Code together"
            onSelectProject={(project: IProject) => {
              if (
                teamsContext?.page?.frameContext === FrameContexts.sidePanel
              ) {
                shareAppContentToStage(project.containerId);
              } else {
                navigate({
                  pathname: `/projects/${project.containerId}`,
                });
              }
            }}
          />
        </FlexColumn>
      </LoadableWrapper>
    </CodeboxLiveProvider>
  );
};
