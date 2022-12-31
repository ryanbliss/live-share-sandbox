import { FC } from "react";
import { Button, mergeClasses, Text, Title3 } from "@fluentui/react-components";
import { Delete24Regular } from "@fluentui/react-icons";
import { Card } from "@fluentui/react-components/unstable";
import {
  useCodeboxLiveContext,
  useTeamsClientContext,
} from "../../context-providers";
import { IProject } from "../../models";
import { FlexRow } from "../flex";
import { FrameContexts } from "@microsoft/teams-js";
import { getTextClampStyles } from "../../styles/getTextStyles";
import moment from "moment";

interface IProjectCardProps {
  project: IProject;
  onSelectProject: (project: IProject) => void;
}

export const ProjectCard: FC<IProjectCardProps> = ({
  project,
  onSelectProject,
}) => {
  const { deleteProject } = useCodeboxLiveContext();
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
      <FlexRow spaceBetween>
        <Button
          onClick={() => {
            console.log(
              "ProjectList: opening project with containerId",
              project.containerId
            );
            onSelectProject(project);
          }}
        >
          {selectText}
        </Button>
        <Button
          appearance="subtle"
          icon={<Delete24Regular />}
          onClick={() => {
            deleteProject(project);
          }}
        />
      </FlexRow>
    </Card>
  );
};
