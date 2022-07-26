import * as microsoftTeams from "@microsoft/teams-js";
import { useCallback, useState } from "react";
import { Title2, Subtitle2, Button } from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import { inTeams } from "../../utils/inTeams";
import { LoadableWrapper, FlexColumn } from "../../components";

export const SidePanelPage = () => {
  const [error, setError] = useState<Error | undefined>(undefined);
  const navigate = useNavigate();

  const shareAppContentToStage = useCallback(() => {
    if (inTeams()) {
      microsoftTeams.meeting.shareAppContentToStage((error) => {
        if (error) {
          setError(new Error(error.message));
        }
      }, `${window.location.origin}?inTeams=true`);
    } else {
      navigate({
        pathname: "/",
      });
    }
  }, [navigate, setError]);

  return (
    <LoadableWrapper loading={false} error={error}>
      <FlexColumn
        expand="fill"
        vAlign="center"
        hAlign="center"
        marginSpacer="small"
      >
        <Title2 block align="center">
          {"Welcome to Live Share Sandbox!"}
        </Title2>
        <Subtitle2 block align="center">
          {"Press the share button to continue."}
        </Subtitle2>
        <Button onClick={shareAppContentToStage}>{"Share"}</Button>
      </FlexColumn>
    </LoadableWrapper>
  );
};
