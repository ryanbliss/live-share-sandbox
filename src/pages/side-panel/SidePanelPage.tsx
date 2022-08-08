import * as microsoftTeams from "@microsoft/teams-js";
import { useCallback, useState } from "react";
import { Title2, Subtitle2, Button } from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import { inTeams } from "../../utils/inTeams";
import { LoadableWrapper, FlexColumn } from "../../components";
import { CodeboxLiveProvider } from "../../context-providers";
import { ProjectList } from "../../components/project-list/ProjectList";
import { IProject } from "../../models";

export const SidePanelPage = () => {
  const [error, setError] = useState<Error | undefined>(undefined);
  const navigate = useNavigate();

  const shareAppContentToStage = useCallback(
    (containerId: string) => {
      if (inTeams()) {
        microsoftTeams.meeting.shareAppContentToStage((error) => {
          if (error) {
            setError(new Error(error.message));
          }
        }, `${window.location.origin}?inTeams=true&containerId=${containerId}`);
      } else {
        navigate({
          pathname: `/?containerId=${containerId}`,
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
              shareAppContentToStage(project.containerId);
            }}
          />
        </FlexColumn>
      </LoadableWrapper>
    </CodeboxLiveProvider>
  );
};
