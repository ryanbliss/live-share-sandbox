import { FrameContexts } from "@microsoft/teams-js";
import { FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { inTeams } from "../../utils";
import { FlexRow } from "../flex";
import { Home28Filled } from "@fluentui/react-icons";
import { Button, tokens } from "@fluentui/react-components";
import { useTeamsClientContext } from "../../context-providers";

interface INavigationBarProps {
  isL1: boolean;
  leftActions?: ReactNode;
  rightActions?: ReactNode;
}

export const NavigationBar: FC<INavigationBarProps> = ({
  isL1,
  leftActions,
  rightActions,
}) => {
  const { teamsContext } = useTeamsClientContext();
  const navigate = useNavigate();
  return (
    <FlexRow
      expand="horizontal"
      spaceBetween
      marginSpacer="small"
      vAlign="center"
      hAlign="start"
      style={{
        borderBottomStyle: "solid",
        borderBottomColor: tokens.colorNeutralStroke1,
        borderBottomWidth: "1px",
        height: "44px",
      }}
    >
      <FlexRow
        vAlign="center"
        marginSpacer="small"
        style={{ paddingLeft: "8px" }}
      >
        {teamsContext?.page?.frameContext !== FrameContexts.meetingStage &&
          teamsContext?.page?.frameContext !== FrameContexts.sidePanel && (
            <>
              {isL1 && (
                <Button
                  appearance="subtle"
                  onClick={() => {
                    navigate(`/?inTeams=${inTeams()}`);
                  }}
                >
                  {"Codebox Live"}
                </Button>
              )}
              {!isL1 && (
                <Button
                  icon={<Home28Filled />}
                  appearance="subtle"
                  onClick={() => {
                    navigate(`/?inTeams=${inTeams()}`);
                  }}
                />
              )}
            </>
          )}
        {leftActions || null}
      </FlexRow>
      <FlexRow
        vAlign="center"
        style={{ paddingRight: "8px" }}
        marginSpacer="smaller"
      >
        {rightActions}
      </FlexRow>
    </FlexRow>
  );
};
