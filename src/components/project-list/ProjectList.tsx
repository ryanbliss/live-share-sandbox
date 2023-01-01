import { Tab, TabList, Text, Title1 } from "@fluentui/react-components";
import { FrameContexts } from "@microsoft/teams-js";
import { FC } from "react";
import {
  useCodeboxLiveContext,
  useTeamsClientContext,
} from "../../context-providers";
import { IProject } from "../../models";
import { FlexColumn, FlexItem, FlexRow } from "../flex";
import { LoadableWrapper } from "../view-wrappers";
import {
  CreateProjectViaGitDialog,
  CreateProjectViaTemplateDialog,
} from "../create-project";
import { ProjectCard } from "./ProjectCard";
import { ScrollWrapper } from "../scroll-wrapper/ScrollWrapper";

interface IProjectListProps {
  onSelectProject: (project: IProject) => void;
}

export const ProjectList: FC<IProjectListProps> = ({ onSelectProject }) => {
  const { userProjects, loading, error } = useCodeboxLiveContext();
  const { teamsContext } = useTeamsClientContext();
  const isSidePanel =
    teamsContext?.page.frameContext === FrameContexts.sidePanel;

  return (
    <LoadableWrapper loading={loading} error={error}>
      <ScrollWrapper>
        <FlexColumn
          marginSpacer="medium"
          style={{
            paddingLeft: isSidePanel ? "0px" : "124px",
            paddingRight: isSidePanel ? "0px" : "124px",
            paddingTop: isSidePanel ? "0px" : "60px",
            paddingBottom: isSidePanel ? "0px" : "16px",
            height: "100%",
          }}
        >
          <Title1>{"Projects"}</Title1>
          <FlexItem noShrink>
            <FlexRow spaceBetween vAlign="center" wrap>
              {!isSidePanel && (
                <TabList selectedValue={"created"}>
                  <Tab value="created">{"Created"}</Tab>
                </TabList>
              )}
              <FlexRow marginSpacer="small">
                <CreateProjectViaGitDialog />
                <CreateProjectViaTemplateDialog />
              </FlexRow>
            </FlexRow>
          </FlexItem>
          {userProjects.length === 0 && (
            <FlexColumn>
              <Text>{"Create a project to get started"}</Text>
            </FlexColumn>
          )}
          {userProjects.length > 0 && (
            <FlexColumn expand="fill" marginSpacer="small">
              {userProjects.map((project) => {
                return (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    onSelectProject={onSelectProject}
                  />
                );
              })}
            </FlexColumn>
          )}
        </FlexColumn>
      </ScrollWrapper>
    </LoadableWrapper>
  );
};
