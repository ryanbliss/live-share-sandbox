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
  const { userProjects, loading, error, createProject } =
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
            <CompoundButton
              icon={<ClipboardCode24Regular />}
              secondaryContent={"TypeScript"}
              onClick={() => {
                createProject("react-ts");
              }}
              style={{
                marginBottom: "12px",
              }}
            >
              {"New React app"}
            </CompoundButton>
            <CompoundButton
              icon={<ClipboardCode24Regular />}
              secondaryContent={"TypeScript"}
              onClick={() => {
                createProject("live-share-react-ts");
              }}
              style={{
                marginBottom: "12px",
              }}
            >
              {"New Live Share app"}
            </CompoundButton>
            <CompoundButton
              icon={<ClipboardCode24Regular />}
              secondaryContent={"TypeScript"}
              onClick={() => {
                createProject("afr-react-ts");
              }}
              style={{
                marginBottom: "12px",
              }}
            >
              {"New Azure Fluid Relay app"}
            </CompoundButton>
            <CompoundButton
              icon={<ClipboardCode24Regular />}
              secondaryContent={"TypeScript"}
              onClick={() => {
                createProject("teams-react-ts");
              }}
              style={{
                marginBottom: "12px",
              }}
            >
              {"New Teams app"}
            </CompoundButton>
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
                        console.log("ProjectList: opening project with containerId", project.containerId);
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
