import { FluentProvider, teamsDarkTheme } from "@fluentui/react-components";
import "./App.css";
import PageWrapper from "./components/page-wrapper/PageWrapper";
import SandpackLive from "./components/sandpack-live/SandpackLive";
import { useLiveShare } from "./live-share-hooks/useLiveShare";
import { useTeamsContext } from "./teams-js-hooks/useTeamsContext";

function App() {
  const {
    loading,
    error,
    container,
    codePagesMap,
    sandpackObjectsMap,
    followModeState,
    presence,
  } = useLiveShare();

  const teamsContext = useTeamsContext();

  return (
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
        <PageWrapper loading={loading} error={error}>
          <SandpackLive
            template={"react"}
            codePagesMap={codePagesMap}
            followModeState={followModeState}
            presence={presence}
            container={container}
            teamsContext={teamsContext}
          />
        </PageWrapper>
      </FluentProvider>
    </div>
  );
}

export default App;
