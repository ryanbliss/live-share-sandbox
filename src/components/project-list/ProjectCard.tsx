import { FC } from "react";
import {
  Button,
  mergeClasses,
  Text,
  Title3,
  tokens,
} from "@fluentui/react-components";
import { Card } from "@fluentui/react-components/unstable";
import { useTeamsClientContext } from "../../context-providers";
import { IProject } from "../../models";
import { FlexRow } from "../flex";
import { FrameContexts } from "@microsoft/teams-js";
import { getTextClampStyles } from "../../styles/getTextStyles";
import moment from "moment";
import { ProjectOverflowMenu } from "../menus/ProjectOverflowMenu";
import { ShareMenu } from "../menus";

interface IProjectCardProps {
  project: IProject;
  onSelectProject: (project: IProject) => void;
}

export const ProjectCard: FC<IProjectCardProps> = ({
  project,
  onSelectProject,
}) => {
  const { teamsContext } = useTeamsClientContext();
  const { root: clampStyle, twoLines: twoLinesStyle } = getTextClampStyles();
  const selectText =
    teamsContext?.page?.frameContext === FrameContexts.sidePanel
      ? "Code together"
      : "Open";
  return (
    <Card
      appearance="filled"
      style={{
        width: "100%",
        marginBottom: "12px",
      }}
    >
      <FlexRow>
        <Title3
          align="start"
          className={mergeClasses(clampStyle, twoLinesStyle)}
        >
          {project.title}
        </Title3>
      </FlexRow>
      <FlexRow>
        <Text align="start" className={mergeClasses(clampStyle)}>
          {`${project.framework} ${project.language} | ${moment(
            project.createdAt
          ).fromNow()}`}
        </Text>
      </FlexRow>
      <FlexRow spaceBetween vAlign="center">
        <FlexRow vAlign="center" marginSpacer="smaller">
          <ShareMenu project={project} />
          <ProjectOverflowMenu project={project} />
        </FlexRow>
        <Button
          appearance="subtle"
          size="medium"
          onClick={() => {
            console.log(
              "ProjectList: opening project with containerId",
              project.containerId
            );
            onSelectProject(project);
          }}
          style={{
            color: tokens.colorBrandForeground1,
          }}
        >
          {selectText}
        </Button>
      </FlexRow>
    </Card>
  );
};
