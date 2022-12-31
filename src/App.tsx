import {
  FluentProvider,
  teamsDarkTheme,
  tokens,
} from "@fluentui/react-components";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProjectsPage, AppSettingsPage, CodeProjectPage } from "./pages";
import "./App.css";
import { TeamsClientProvider } from "./context-providers";
import { inTeams } from "./utils";
import { useState } from "react";

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
              <Route path={"/"} element={<ProjectsPage />} />
              <Route
                path={"/projects/:projectId"}
                element={<CodeProjectPage />}
              />
              <Route path={"/app-settings"} element={<AppSettingsPage />} />
            </Routes>
          </Router>
        </div>
      </TeamsClientProvider>
    </FluentProvider>
  );
}

export default App;
