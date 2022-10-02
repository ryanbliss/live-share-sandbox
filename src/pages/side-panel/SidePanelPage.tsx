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
    <CodeboxLiveProvider>
      <LoadableWrapper loading={false} error={error}>
        <FlexColumn expand="fill" vAlign="center" marginSpacer="small">
          <ProjectList
            selectText="Code together"
            onSelectProject={(project: IProject) => {
              if (
                teamsContext?.page?.frameContext === FrameContexts.sidePanel
              ) {
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
    </CodeboxLiveProvider>
  );
};
