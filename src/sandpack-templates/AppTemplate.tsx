export const AppTemplate = `
import * as microsoftTeams from "@microsoft/teams-js";
import { LOCAL_MODE_TENANT_ID } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";
// in your production app, import from "@microsoft/live-share";
// import { TeamsFluidClient } from "./LiveShareSandboxApi";
import { useEffect, useState, useRef } from "react";
import Header from "./Header";
import { SharedMap } from "@fluidframework/map";

export default function App() {
  const counterMapRef = useRef();
  const [counterValue, setCounterValue] = useState(0);

  useEffect(() => {
    // Join container on app load
    const start = async () => {
      const inTeams = false;
      let connection;
      if (inTeams) {
        await microsoftTeams.app.initialize();
      } else {
        connection = {
          tenantId: LOCAL_MODE_TENANT_ID,
          tokenProvider: new InsecureTokenProvider("", {
            id: "123",
          }),
          orderer: "http://localhost:7070",
          storage: "http://localhost:7070",
        };
      }
      // Define any additional client settings (optional).
      // - connection: A custom Fluid Relay Service connection to use.
      // - logger: A fluid logger to use.
      const clientProps = {
        connection,
      };

      // Define container callback (optional).
      // * This is only called once when the container is first created.
      const onFirstInitialize = (container) => {
        console.log("useSharedObjects: onFirstInitialize called");
        // Setup any initial state here
      };

      // Define container schema
      const schema = {
        initialObjects: {
          counterMap: SharedMap,
        },
      };

      // Create the client, join container, and set results
      console.log("useSharedObjects: joining container");
      // const client = new TeamsFluidClient(clientProps);
      // client
      //   .joinContainer(schema, onFirstInitialize)
      //   .then((results: any) => {
      //     console.log("useSharedObjects: joined container");
      //     const { container } = results;
      //     counterMapRef.current = container.initialObjects.counterMap;
      //     counterMapRef.current.on('valueChanged', () => {
      //       setCounterValue(counterMapRef.current.get("count"));
      //     });
      //   })
      //   .catch((err) => setError(err));
    };
    start();
  }, []);
  return (
    <div>
      <Header />
      <p>Click the button to iterate the counter</p>
      <button onClick={() => {
        counterMapRef.current?.set("count", counterValue + 1);
      }}>+1</button>
    </div>
  )
}
`;
