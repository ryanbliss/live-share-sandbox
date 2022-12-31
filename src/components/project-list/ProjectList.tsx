import { Button, CompoundButton, Title2 } from "@fluentui/react-components";
import { Card } from "@fluentui/react-components/unstable";
import { FrameContexts } from "@microsoft/teams-js";
import { FC } from "react";
import {
  useCodeboxLiveContext,
  useTeamsClientContext,
} from "../../context-providers";
import { ClipboardCode24Regular, Delete24Regular } from "@fluentui/react-icons";
import { IProject } from "../../models";
import { FlexColumn, FlexItem, FlexRow } from "../flex";
import { LoadableWrapper } from "../view-wrappers";

interface IProjectListProps {
  onSelectProject: (project: IProject) => void;
}

export const ProjectList: FC<IProjectListProps> = ({ onSelectProject }) => {
  const {
    userProjects,
    projectTemplates,
    loading,
    error,
    createProject,
    deleteProject,
  } = useCodeboxLiveContext();
  const { teamsContext } = useTeamsClientContext();
  const selectText =
    teamsContext?.page?.frameContext === FrameContexts.sidePanel
      ? "Code together"
      : "Open";

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
            {projectTemplates?.map((template) => {
              let secondaryContent: string = template.language;
              if (template.framework) {
                secondaryContent += ` | ${template.framework}`;
              }
              return (
                <CompoundButton
                  key={template.gitRemoteUrl}
                  icon={<ClipboardCode24Regular />}
                  secondaryContent={secondaryContent}
                  onClick={() => {
                    createProject(template);
                  }}
                  style={{
                    marginBottom: "12px",
                  }}
                >
                  {`+ ${template.title}`}
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
              <div key={project._id}>
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
              </div>
            );
          })}
        </FlexRow>
      </FlexColumn>
    </LoadableWrapper>
  );
};
