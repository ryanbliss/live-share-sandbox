import {
  SelectTabEventHandler,
  Tab,
  TabList,
  Text,
  Title1,
} from "@fluentui/react-components";
import { FrameContexts } from "@microsoft/teams-js";
import { FC, memo, useCallback, useState } from "react";
import {
  useCodeboxLiveContext,
  useTeamsClientContext,
} from "../../context-providers";
import { FlexColumn, FlexItem, FlexRow } from "../flex";
import { LoadableWrapper } from "../view-wrappers";
import {
  CreateProjectActions,
  CreateProjectViaGitDialog,
  CreateProjectViaTemplateDialog,
} from "../create-project";
import { ProjectCard } from "./ProjectCard";
import { ScrollWrapper } from "../scroll-wrapper/ScrollWrapper";

interface IProjectListProps {}

enum ProjectListTabType {
  recent = "Recent",
  owned = "Owned",
  pinned = "Pinned",
}

function isProjectListTabType(value: any): value is ProjectListTabType {
  return Object.values(ProjectListTabType).includes(value);
}

export const ProjectList: FC<IProjectListProps> = memo(({}) => {
  const { teamsContext } = useTeamsClientContext();
  const isSidePanel =
    teamsContext?.page.frameContext === FrameContexts.sidePanel;
  const threadId = teamsContext?.chat?.id || teamsContext?.channel?.id;
  const [selectedTab, setSelectedTab] = useState<ProjectListTabType>(
    threadId ? ProjectListTabType.pinned : ProjectListTabType.recent
  );
  const { recentProjects, userProjects, pinnedProjects, loading, error } =
    useCodeboxLiveContext();

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
          {!isSidePanel && <Title1>{"Projects"}</Title1>}
          <FlexItem noShrink>
            <FlexRow spaceBetween vAlign="center" wrap>
              <TabList selectedValue={selectedTab} onTabSelect={onTabSelect}>
                {!!threadId && (
                  <Tab value={ProjectListTabType.pinned}>{"Pinned"}</Tab>
                )}
                <Tab value={ProjectListTabType.recent}>{"Recent"}</Tab>
                <Tab value={ProjectListTabType.owned}>{"Owned"}</Tab>
              </TabList>
              <CreateProjectActions />
            </FlexRow>
          </FlexItem>
          {selectedTab === ProjectListTabType.pinned && (
            <>
              {pinnedProjects.length === 0 && (
                <FlexColumn>
                  <Text>{"Create a project to get started"}</Text>
                </FlexColumn>
              )}
              {pinnedProjects.length > 0 && (
                <FlexColumn expand="fill" marginSpacer="small">
                  {pinnedProjects.map((project) => {
                    return (
                      <ProjectCard
                        key={`pinned-project-${project._id}`}
                        project={project}
                      />
                    );
                  })}
                </FlexColumn>
              )}
            </>
          )}
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
});
