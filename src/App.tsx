import { FluentProvider, teamsDarkTheme } from "@fluentui/react-components";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  SidePanelPage,
  AppSettingsPage,
  MeetingStagePage,
  CodeProjectPage,
} from "./pages";
import "./App.css";
import { TeamsClientProvider } from "./context-providers";

function App() {
  return (
    <FluentProvider
      theme={teamsDarkTheme}
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
      <TeamsClientProvider>
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
              <Route path={"/"} element={<SidePanelPage />} />
              <Route
                path={"/projects/:containerId"}
                element={<CodeProjectPage />}
              />
              <Route
                path={"/meeting/projects/:containerId"}
                element={<MeetingStagePage />}
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
