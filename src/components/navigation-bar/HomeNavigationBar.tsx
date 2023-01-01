import { Tab, TabList } from "@fluentui/react-components";
import { FC } from "react";
import { useLocation } from "react-router-dom";
import { NavigationBar } from "./NavigationBar";

export const HomeNavigationBar: FC = () => {
  const location = useLocation();
  return (
    <NavigationBar
      isL1={true}
      leftActions={
        <TabList selectedValue={location.pathname}>
          <Tab value={"/projects"}>{"Projects"}</Tab>
        </TabList>
      }
    />
  );
};
