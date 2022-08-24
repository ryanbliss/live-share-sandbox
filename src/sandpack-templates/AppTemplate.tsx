export const LocalAppTemplate = `
import { useEffect, useState, useRef } from "react";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";
import { IFluidContainer } from "@fluidframework/fluid-static";
import { SharedMap } from "@fluidframework/map";
// in your production app, import TeamsFluidClient from "@microsoft/live-share"
import { TeamsFluidClient } from "./LiveShareSandboxApi";
// Create new components and import them like this
import Header from "./Header";

export default function App() {
  const counterMapRef = useRef<SharedMap | undefined>();
  const initRef = useRef<boolean>(false);
  const [counterValue, setCounterValue] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    if (initRef.current) {
      return;
    }
    initRef.current = true;
    // Join container on app load
    const start = async () => {
      // Define container schema
      const schema = {
        initialObjects: {
          counterMap: SharedMap,
        },
      };
      // Define custom connection for local testing
      const connection = {
        type: "local",
        tokenProvider: new InsecureTokenProvider("", {
          id: "123",
        }),
        endpoint: "http://localhost:7070",
      };
      // Define any additional client settings (optional).
      // - connection: A custom Fluid Relay Service connection to use.
      // - logger: A fluid logger to use.
      const clientProps = {
        connection,
      };

      // Define container callback (optional).
      // * This is only called once when the container is first created.
      const onFirstInitialize = (container: IFluidContainer) => {
        console.log("App.tsx: onFirstInitialize called");
        // Setup any initial state here
      };
      // Create the client, join container, and set results
      console.log("App.tsx: joining container");
      const client = new TeamsFluidClient(clientProps);
      client
        .joinContainer(schema, onFirstInitialize)
        .then((results) => {
          console.log("App.tsx: joined container");
          const { container } = results;
          counterMapRef.current = container.initialObjects
            .counterMap as SharedMap;
          counterMapRef.current!.on("valueChanged", () => {
            setCounterValue(counterMapRef.current!.get("count") ?? 0);
          });
          setStarted(true);
          setCounterValue(counterMapRef.current!.get("count") ?? 0);
        })
        .catch((err: any) => {
          throw err;
        });
    };
    start();
  });
  return (
    <div>
      {started && (
        <>
          <Header />
          <p>{"Click the button to iterate the counter"}</p>
          <button
            onClick={() => {
              counterMapRef.current!.set("count", counterValue + 1);
            }}
          >
            {"+1"}
          </button>
          <h2 style={{ color: "red" }}>{counterValue}</h2>
        </>
      )}
      {!started && <div>{"Loading..."}</div>}
    </div>
  );
}
`;

export const LiveShareAppTemplate = `
import { useEffect, useState, useRef } from "react";
import { IFluidContainer } from "@fluidframework/fluid-static";
import { SharedMap } from "@fluidframework/map";
// this package is not intended for use outside of a Codebox Live sandbox
import { CodeboxLiveClient } from "@codeboxlive/extensions-core";
// in your production app, import TeamsFluidClient from "@microsoft/live-share"
import { CodeboxLiveFluidClient } from "@codeboxlive/extensions-fluid";
import Header from "./Header";

export default function App() {
  const counterMapRef = useRef<SharedMap | undefined>();
  const initRef = useRef<boolean>(false);
  const [counterValue, setCounterValue] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    // Join container on app load
    async function start(): Promise<void> {
      // Initialize the CodeboxLiveClient so that this sandbox app can communicate
      // with the Codebox Live application using window post messages. This is used
      // to authenticate a Fluid container when testing this app in a sandbox.
      await CodeboxLiveClient.initialize();

      // Define container schema
      const schema = {
        initialObjects: {
          counterMap: SharedMap,
        },
      };
      // Define container callback for when container is first created
      const onFirstInitialize = (container: IFluidContainer) => {
        // Setup any initial state here
      };
      const client = new CodeboxLiveFluidClient();
      const results = await client
        .joinContainer(schema, onFirstInitialize);

      counterMapRef.current = results?.container.initialObjects
        .counterMap as SharedMap;
      // Listen for changes to the value
      counterMapRef.current!.on("valueChanged", () => {
        setCounterValue(counterMapRef.current!.get("count") ?? 0);
      });
      setStarted(true);
      setCounterValue(counterMapRef.current!.get("count") ?? 0);
    };
    start()
      .catch((error: any) => console.error(error));
  });
  return (
    <div>
      {started && (
        <>
          <Header />
          <p>{"Click the button to iterate the counter"}</p>
          <button
            onClick={() => {
              counterMapRef.current!.set("count", counterValue + 1);
            }}
          >
            {"+1"}
          </button>
          <h2 style={{ color: "red" }}>{counterValue}</h2>
        </>
      )}
      {!started && <div>{"Loading..."}</div>}
    </div>
  );
}
`;

export const AFRAppTemplate = `
import { useEffect, useState, useRef } from "react";
import { IFluidContainer } from "@fluidframework/fluid-static";
import { SharedMap } from "@fluidframework/map";
// this package is not intended for use outside of a Codebox Live sandbox
import { CodeboxLiveClient } from "@codeboxlive/extensions-core";
// in your production app, import AzureClient from "@fluidframework/azure-client"
import { CodeboxLiveFluidClient } from "@codeboxlive/extensions-fluid";
import Header from "./Header";

export default function App() {
  const counterMapRef = useRef<SharedMap | undefined>();
  const initRef = useRef<boolean>(false);
  const [counterValue, setCounterValue] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    // Join container on app load
    async function start(): Promise<void> {
      // Initialize the CodeboxLiveClient so that this sandbox app can communicate
      // with the Codebox Live application using window post messages. This is used
      // to authenticate a Fluid container when testing this app in a sandbox.
      await CodeboxLiveClient.initialize();

      // Define container schema
      const schema = {
        initialObjects: {
          counterMap: SharedMap,
        },
      };
      // Define container callback for when container is first created
      const onFirstInitialize = (container: IFluidContainer) => {
        // Setup any initial state here
      };
      const client = new CodeboxLiveFluidClient();
      const results = await client
        .joinContainer(schema, onFirstInitialize);

      counterMapRef.current = results?.container.initialObjects
        .counterMap as SharedMap;
      // Listen for changes to the value
      counterMapRef.current!.on("valueChanged", () => {
        setCounterValue(counterMapRef.current!.get("count") ?? 0);
      });
      setStarted(true);
      setCounterValue(counterMapRef.current!.get("count") ?? 0);
    };
    start()
      .catch((error: any) => console.error(error));
  });
  return (
    <div>
      {started && (
        <>
          <Header />
          <p>{"Click the button to iterate the counter"}</p>
          <button
            onClick={() => {
              counterMapRef.current!.set("count", counterValue + 1);
            }}
          >
            {"+1"}
          </button>
          <h2 style={{ color: "red" }}>{counterValue}</h2>
        </>
      )}
      {!started && <div>{"Loading..."}</div>}
    </div>
  );
}
`;

export const ReactTSAppTemplate = `
import { useState, useRef } from "react";
import Header from "./Header";

export default function App() {
  const [counter, setCounter] = useState<number>(0);

  return (
    <div>
      <Header />
      <p>{"Click to increment the counter!"}</p>
      <button onClick={() => {
        setCounter(counter + 1);
      }}>
        {counter}
      </button>
    </div>
  );
}
`;

export const TeamsAppTemplate = `
import { useEffect, useState, useRef } from "react";
import * as microsoftTeams from "@microsoft/teams-js";
import { AUTHORIZED_PARENT_ORIGINS } from "./LiveShareSandboxApi";
// Create new components and import them like this
import Header from "./Header";

export default function App() {
  const initRef = useRef<boolean>(false);
  const [contextValue, setContextValue] = useState<string>("loading");

  useEffect(() => {
    if (initRef.current) {
      return;
    }
    initRef.current = true;
    microsoftTeams.app
      .initialize(AUTHORIZED_PARENT_ORIGINS)
      .then(() => {
        microsoftTeams.app
          .getContext()
          .then((context: microsoftTeams.app.Context) => {
            setContextValue(JSON.stringify(context));
          })
          .catch((error) => setContextValue(error.message));
      })
      .catch((error) => setContextValue(error.message));
  });
  return (
    <>
      <Header />
      <h3>{"Teams app context:"}</h3>
      <p>{contextValue}</p>
    </>
  );
}
`;
