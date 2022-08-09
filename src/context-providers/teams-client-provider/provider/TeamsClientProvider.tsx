import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { app } from "@microsoft/teams-js";
import { LoadableWrapper } from "../../../components/view-wrappers";
import { TeamsClientContext } from "../internals";
import { useTeamsAppContext } from "../internals/data";
import { inTeams } from "../../../utils";
import { Theme } from "@fluentui/react-components";

export const TeamsClientProvider: FC<{
  children: ReactNode;
  setTheme: Dispatch<SetStateAction<Theme>>;
}> = ({ children, setTheme }) => {
  const [initialized, setInitialized] = useState(false);
  const [initializeError, setError] = useState<Error | undefined>(undefined);
  const { teamsContext, error: appContextError } = useTeamsAppContext(
    initialized,
    setTheme
  );

  useEffect(() => {
    if (!initialized) {
      if (inTeams()) {
        console.log("App.tsx: initializing client SDK");
        app
          .initialize([
            "https://1-2-2-sandpack.codesandbox.io",
            "https://teams.microsoft.com",
            "https://live-share-sandbox.vercel.app",
          ])
          .then(() => {
            console.log("App.tsx: initializing client SDK initialized");
            app.notifyAppLoaded();
            app.notifySuccess();
            setInitialized(true);
          })
          .catch((error) => setError(error));
      } else {
        setInitialized(true);
      }
    }
  }, [initialized]);

  const isLoading = !initialized || !teamsContext;
  const error = initializeError || appContextError;
  return (
    <TeamsClientContext.Provider
      value={{
        teamsContext,
      }}
    >
      <LoadableWrapper loading={isLoading} error={error}>
        {children}
      </LoadableWrapper>
    </TeamsClientContext.Provider>
  );
};
