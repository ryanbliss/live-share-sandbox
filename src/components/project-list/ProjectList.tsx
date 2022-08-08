import { Button, Title2 } from "@fluentui/react-components";
import { Card } from "@fluentui/react-components/unstable";
import { FrameContexts } from "@microsoft/teams-js";
import { FC } from "react";
import {
  useCodeboxLiveContext,
  useTeamsClientContext,
} from "../../context-providers";
import { IProject } from "../../models";
import { FlexColumn, FlexItem, FlexRow } from "../flex";

interface IProjectListProps {
  selectText: string;
  onSelectProject: (project: IProject) => void;
}

export const ProjectList: FC<IProjectListProps> = ({
  selectText,
  onSelectProject,
}) => {
  const { userProjects, createProject } = useCodeboxLiveContext();
  const { teamsContext } = useTeamsClientContext();

  return (
    <FlexColumn scroll expand="fill">
      <FlexItem noShrink>
        <FlexRow marginSpacer="small" wrap>
          <Button
            onClick={() => {
              createProject("live-share-react-ts");
            }}
          >
            {"Create Live Share App"}
          </Button>
          <Button
            onClick={() => {
              createProject("afr-react-ts");
            }}
          >
            {"Create AFR App"}
          </Button>
        </FlexRow>
      </FlexItem>
      <FlexRow wrap>
        {userProjects.map((project) => {
          return (
            <div key={project.containerId}>
              <Card
                style={{
                  width: "280px",
                  marginRight:
                    teamsContext?.page.frameContext === FrameContexts.sidePanel
                      ? "0px"
                      : "12px",
                  marginBottom: "12px",
                }}
              >
                <FlexRow>
                  <Title2 align="start">{project.title}</Title2>
                </FlexRow>
                <FlexRow>
                  <Button
                    onClick={() => {
                      onSelectProject(project);
                    }}
                  >
                    {selectText}
                  </Button>
                </FlexRow>
              </Card>
            </div>
          );
        })}
      </FlexRow>
    </FlexColumn>
  );
};
