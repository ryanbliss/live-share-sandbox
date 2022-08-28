import { Button, CompoundButton, Title2 } from "@fluentui/react-components";
import { Card } from "@fluentui/react-components/unstable";
import { FrameContexts } from "@microsoft/teams-js";
import { FC } from "react";
import {
  useCodeboxLiveContext,
  useTeamsClientContext,
} from "../../context-providers";
import { ClipboardCode24Regular } from "@fluentui/react-icons";
import { IProject } from "../../models";
import { FlexColumn, FlexItem, FlexRow } from "../flex";
import { LoadableWrapper } from "../view-wrappers";

interface IProjectListProps {
  selectText: string;
  onSelectProject: (project: IProject) => void;
}

export const ProjectList: FC<IProjectListProps> = ({
  selectText,
  onSelectProject,
}) => {
  const { userProjects, projectTemplates, loading, error, createProject } =
    useCodeboxLiveContext();
  const { teamsContext } = useTeamsClientContext();

  return (
    <LoadableWrapper loading={loading} error={error}>
      <FlexColumn scroll expand="fill" marginSpacer="small">
        <FlexItem
          noShrink
          style={{
            padding:
              teamsContext?.page.frameContext === FrameContexts.sidePanel
                ? "0px"
                : "24px",
            paddingBottom: "0px",
          }}
        >
          <FlexRow marginSpacer="small" wrap>
            {projectTemplates.map((template) => {
              let secondaryContent: string = template.language;
              if (template.framework) {
                secondaryContent += ` | ${template.framework}`;
              }
              return (
                <CompoundButton
                  key={template.id}
                  icon={<ClipboardCode24Regular />}
                  secondaryContent={secondaryContent}
                  onClick={() => {
                    createProject(template);
                  }}
                  style={{
                    marginBottom: "12px",
                  }}
                >
                  {`+ ${template.name}`}
                </CompoundButton>
              );
            })}
          </FlexRow>
        </FlexItem>
        <FlexRow
          wrap
          style={{
            padding:
              teamsContext?.page.frameContext === FrameContexts.sidePanel
                ? "0px"
                : "24px",
            paddingBottom: "0px",
            paddingTop: "0px",
          }}
        >
          {userProjects.map((project) => {
            return (
              <div key={project.containerId}>
                <Card
                  style={{
                    width:
                      teamsContext?.page.frameContext ===
                      FrameContexts.sidePanel
                        ? "100vw"
                        : "280px",
                    marginRight:
                      teamsContext?.page.frameContext ===
                      FrameContexts.sidePanel
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
                        console.log(
                          "ProjectList: opening project with containerId",
                          project.containerId
                        );
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
    </LoadableWrapper>
  );
};
