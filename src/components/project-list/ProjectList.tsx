import {
  SelectTabEventHandler,
  Tab,
  TabList,
  Text,
  Title1,
} from "@fluentui/react-components";
import { FrameContexts } from "@microsoft/teams-js";
import { FC, useCallback, useState } from "react";
import {
  useCodeboxLiveContext,
  useTeamsClientContext,
} from "../../context-providers";
import { FlexColumn, FlexItem, FlexRow } from "../flex";
import { LoadableWrapper } from "../view-wrappers";
import {
  CreateProjectViaGitDialog,
  CreateProjectViaTemplateDialog,
} from "../create-project";
import { ProjectCard } from "./ProjectCard";
import { ScrollWrapper } from "../scroll-wrapper/ScrollWrapper";

interface IProjectListProps {}

enum ProjectListTabType {
  recent = "Recent",
  owned = "Owned",
}

function isProjectListTabType(value: any): value is ProjectListTabType {
  return Object.values(ProjectListTabType).includes(value);
}

export const ProjectList: FC<IProjectListProps> = ({}) => {
  const [selectedTab, setSelectedTab] = useState<ProjectListTabType>(
    ProjectListTabType.recent
  );
  const { recentProjects, userProjects, loading, error } =
    useCodeboxLiveContext();
  const { teamsContext } = useTeamsClientContext();
  const isSidePanel =
    teamsContext?.page.frameContext === FrameContexts.sidePanel;

  const onTabSelect: SelectTabEventHandler = useCallback((ev, data) => {
    if (isProjectListTabType(data.value)) {
      setSelectedTab(data.value);
    }
  }, []);

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
                <TabList selectedValue={selectedTab} onTabSelect={onTabSelect}>
                  <Tab value={ProjectListTabType.recent}>{"Recent"}</Tab>
                  <Tab value={ProjectListTabType.owned}>{"Owned"}</Tab>
                </TabList>
              )}
              <FlexRow marginSpacer="small">
                <CreateProjectViaGitDialog />
                <CreateProjectViaTemplateDialog />
              </FlexRow>
            </FlexRow>
          </FlexItem>
          {selectedTab === ProjectListTabType.recent && (
            <>
              {recentProjects.length === 0 && (
                <FlexColumn>
                  <Text>{"Create a project to get started"}</Text>
                </FlexColumn>
              )}
              {recentProjects.length > 0 && (
                <FlexColumn expand="fill" marginSpacer="small">
                  {recentProjects.map((project) => {
                    return (
                      <ProjectCard
                        key={`recent-project-${project._id}`}
                        project={project}
                      />
                    );
                  })}
                </FlexColumn>
              )}
            </>
          )}
          {selectedTab === ProjectListTabType.owned && (
            <>
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
                        key={`owned-project-${project._id}`}
                        project={project}
                      />
                    );
                  })}
                </FlexColumn>
              )}
            </>
          )}
        </FlexColumn>
      </ScrollWrapper>
    </LoadableWrapper>
  );
};
