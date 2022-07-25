import * as microsoftTeams from "@microsoft/teams-js";
import { useEffect, useState } from "react";
import { Title2, Subtitle2 } from "@fluentui/react-components";
import { FlexColumn } from "../flex";
import { inTeams } from "../../utils/inTeams";
import PageWrapper from "../page-wrapper/PageWrapper";

export const AppSettingsPage = () => {
  const [registered, setRegistered] = useState<boolean>(false);

  useEffect(() => {
    if (registered) {
      return;
    }
    if (inTeams()) {
      microsoftTeams.pages.config.registerOnSaveHandler((saveEvent) => {
        microsoftTeams.pages.config.setConfig({
          suggestedDisplayName: "Sandbox",
          contentUrl: `${window.location.origin}/side-panel?inTeams=true`,
        });
        saveEvent.notifySuccess();
      });

      microsoftTeams.pages.config.setValidityState(true);
    } else {
      setRegistered(true);
    }
  }, [registered]);

  return (
    <PageWrapper loading={!registered} error={undefined}>
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
          {"Press the save button to continue."}
        </Subtitle2>
      </FlexColumn>
    </PageWrapper>
  );
};
