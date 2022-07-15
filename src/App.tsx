import { FluentProvider, teamsDarkTheme } from "@fluentui/react-components";
import "./App.css";
import PageWrapper from "./components/page-wrapper/PageWrapper";
import SandpackLive from "./components/sandpack-live/SandpackLive";
import { useLiveShare } from "./hooks/useLiveShare";

function App() {
  const { loading, error, container, codePagesMap, sandpackObjectsMap } =
    useLiveShare();

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
            container={container}
          />
        </PageWrapper>
      </FluentProvider>
    </div>
  );
}

export default App;
