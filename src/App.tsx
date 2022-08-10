import { FluentProvider, teamsDarkTheme } from "@fluentui/react-components";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as microsoftTeams from "@microsoft/teams-js";
import { useEffect, useState } from "react";
import { inTeams } from "./utils/inTeams";
import { LoadableWrapper } from "./components/view-wrappers";
import { SidePanelPage, AppSettingsPage, MeetingStagePage } from "./pages";
import "./App.css";
import { GitFileProvider } from "./utils/GitFileProvider";

function App() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!initialized) {
      if (inTeams()) {
        console.log("App.tsx: initializing client SDK");
        microsoftTeams.app
          .initialize([
            "https://1-2-2-sandpack.codesandbox.io",
            "https://teams.microsoft.com",
            "https://live-share-sandbox.vercel.app",
          ])
          .then(() => {
            console.log("App.tsx: initializing client SDK initialized");
            microsoftTeams.app.notifyAppLoaded();
            microsoftTeams.app.notifySuccess();
            setInitialized(true);
          })
          .catch((error) => setError(error));
      } else {
        setInitialized(true);
      }

      GitFileProvider
        .create('dadfafdas' ,'https://github.com/ryanbliss/live-share-sandbox', 'git-handler')
        .then((fileProvider) => {
          fileProvider
            .getFileText('README.md')
            .then((text) => console.log(text))
            .catch((err: any) => console.error(err));

          fileProvider
            .getDir()
            .then((text) => console.log(text))
            .catch((err: any) => console.error(err));

          fileProvider
            .getDir("src/components")
            .then((text) => console.log(text))
            .catch((err: any) => console.error(err));
        })
    }
  }, [initialized]);

  return (
    <LoadableWrapper loading={!initialized} error={error}>
      <div className="App">
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
          <Router window={window} basename="/">
            <Routes>
              <Route path={"/"} element={<MeetingStagePage />} />
              <Route path={"/side-panel"} element={<SidePanelPage />} />
              <Route path={"/app-settings"} element={<AppSettingsPage />} />
            </Routes>
          </Router>
        </FluentProvider>
      </div>
    </LoadableWrapper>
  );
}

export default App;
