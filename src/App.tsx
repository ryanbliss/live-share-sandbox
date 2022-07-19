import { FluentProvider, teamsDarkTheme } from "@fluentui/react-components";
import "./App.css";
import SandpackLive from "./components/sandpack-live/SandpackLive";
import { LiveShareProvider } from "./live-share-hooks/useLiveShare";
import { useTeamsContext } from "./teams-js-hooks/useTeamsContext";

function App() {
  const teamsContext = useTeamsContext();

  return (
    <LiveShareProvider>
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
          <SandpackLive template={"react-ts"} teamsContext={teamsContext} />
        </FluentProvider>
      </div>
    </LiveShareProvider>
  );
}

export default App;
