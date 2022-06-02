import "./App.css";
import PageWrapper from "./components/page-wrapper/PageWrapper";
import SandpackLive from "./components/sandpack-live/SandpackLive";
import { useLiveShare } from "./hooks/useLiveShare";

function App() {
  const { loading, error, codePagesMap, sandpackObjectsMap } = useLiveShare();

  return (
    <div className="App">
      <PageWrapper loading={loading} error={error}>
        <SandpackLive template={"react"} codePagesMap={codePagesMap} />
      </PageWrapper>
    </div>
  );
}

export default App;
