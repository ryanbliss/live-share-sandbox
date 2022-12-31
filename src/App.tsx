import {
  FluentProvider,
  teamsDarkTheme,
  tokens,
} from "@fluentui/react-components";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  ProjectsPage,
  AppSettingsPage,
  CodeProjectPage,
  HomePage,
} from "./pages";
import "./App.css";
import { TeamsClientProvider } from "./context-providers";
import { inTeams } from "./utils";
import { useState } from "react";
import { RouteRedirect } from "./components/router";

function App() {
  const [theme, setTheme] = useState(teamsDarkTheme);
  return (
    <FluentProvider
      theme={theme}
      style={{
        minHeight: "0px",
        position: "absolute",
        left: "0",
        right: "0",
        top: "0",
        bottom: "0",
        overflow: "hidden",
        backgroundColor: inTeams()
          ? "transparent"
          : tokens.colorNeutralBackground3,
      }}
    >
      <TeamsClientProvider setTheme={setTheme}>
        <div
          className="App"
          style={{
            minHeight: "0px",
            position: "absolute",
            left: "0",
            right: "0",
            top: "0",
            bottom: "0",
            overflow: "hidden",
          }}
        >
          <Router window={window} basename="/">
            <Routes>
              <Route path="/" element={<HomePage />}>
                <Route
                  path={"/"}
                  element={
                    <RouteRedirect pathName="/projects" preserveSearch />
                  }
                />
                <Route path={"/projects"} element={<ProjectsPage />} />
                <Route
                  path={"/projects/:projectId"}
                  element={<CodeProjectPage />}
                />
              </Route>
              <Route path={"/app-settings"} element={<AppSettingsPage />} />
            </Routes>
          </Router>
        </div>
      </TeamsClientProvider>
    </FluentProvider>
  );
}

export default App;
