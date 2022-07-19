/*!
 * Copyright (c) Ryan Bliss. All rights reserved.
 * Licensed under the MIT License.
 */

import { EphemeralState, TeamsFluidClient, EphemeralEvent, EphemeralPresence } from "@microsoft/live-share";
import { EphemeralMediaSession } from "@microsoft/live-share-media";
import { LOCAL_MODE_TENANT_ID } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";
import {
  ContainerSchema,
  IFluidContainer,
  SharedDirectory,
  SharedMap,
} from "fluid-framework";
import { SharedString } from "@fluidframework/sequence";
import { createContext, FC, MutableRefObject, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { AppTemplate, HeaderTemplate } from "../sandpack-templates";
import { IFollowModeStateValue } from "./plugins/useFollowModeState";
import PageWrapper from "../components/page-wrapper/PageWrapper";

export interface ILiveShareContext {
  loading: boolean;
  error: Error | undefined;
  container: IFluidContainer | undefined;
  codePagesMap: SharedMap | undefined;
  sandpackObjectsMap: SharedMap | undefined;
  followModeState:
    | EphemeralState<IFollowModeStateValue>
    | undefined;
  presence: EphemeralPresence | undefined;
  userDidCreateContainerRef: MutableRefObject<boolean> | undefined;
}

/**
 * Hook that creates/loads the apps shared objects.
 *
 * @remarks
 * This is an application specific hook that defines the fluid schema of Distributed Data Structures (DDS)
 * used by the app and passes that schema to the `TeamsFluidClient` to create/load your Fluid container.
 *
 * @returns Shared objects managed by the apps fluid container.
 */
function useLiveShare(): ILiveShareContext {
  const [results, setResults] = useState<
    | {
        container: IFluidContainer;
        services: any;
        created: boolean;
      }
    | undefined
  >();
  const [error, setError] = useState<Error | undefined>();
  const userDidCreateContainerRef = useRef<boolean>(false);
  const initalizedRef = useRef<boolean>(false);

  useEffect(() => {
    if (initalizedRef.current) {
      return;
    }
    initalizedRef.current = true;
    console.log("useSharedObjects: starting");
    // Check if user is in Teams
    const url = new URL(window.location.href);
    const inTeams = !!url.searchParams.get("inTeams");

    let connection;
    if (!inTeams) {
      // Configure for local testing (optional).
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
      // getFluidContainerId: (): Promise<string | undefined> => {
      //   let containerId: string | undefined;
      //   const searchParams = new URL(window.location.href).searchParams;
      //   if (searchParams.has("containerId")) {
      //     containerId = new URL(window.location.href).searchParams.get("containerId")!;
      //   }
      //   return Promise.resolve(containerId);
      // },
      // setFluidContainerId: (containerId: string): void => {
      //   const containerId = this.getLocalTestContainerId();
      // },
    };

    // To reset the stored container-id, uncomment below:
    // localStorage.clear();

    // Enable debugger
    window.localStorage.debug = "fluid:*";

    // Define container callback (optional).
    // * This is only called once when the container is first created.
    const onFirstInitialize = (container: IFluidContainer) => {
      console.log("useSharedObjects: onFirstInitialize called");
      userDidCreateContainerRef.current = true;
      container
        .create(SharedString)
        .then((sharedString) => {
          (container.initialObjects.codePagesMap as SharedMap).set(
            "/App.tsx",
            sharedString.handle
          );
          sharedString.insertText(0, AppTemplate);
        })
        .catch((error) => setError(error));
      container
        .create(SharedString)
        .then((sharedString) => {
          (container.initialObjects.codePagesMap as SharedMap).set(
            "/Header.tsx",
            sharedString.handle
          );
          sharedString.insertText(0, HeaderTemplate);
        })
        .catch((error) => setError(error));
      // Setup any initial state here
    };

    // Define container schema
    const schema: ContainerSchema = {
      initialObjects: {
        codePagesMap: SharedMap,
        sandpackObjectsMap: SharedMap,
        followModeState: EphemeralState<IFollowModeStateValue | undefined>,
        presence: EphemeralPresence,
      },
      dynamicObjectTypes: [
        SharedMap,
        SharedString,
        EphemeralPresence,
        EphemeralMediaSession,
        EphemeralEvent,
        SharedDirectory,
      ],
    };

    // Create the client, join container, and set results
    console.log("useSharedObjects: joining container");
    const client = new TeamsFluidClient(clientProps);
    client
      .joinContainer(schema, onFirstInitialize)
      .then((results: any) => {
        console.log("useSharedObjects: joined container");
        setResults(results);
      })
      .catch((err) => setError(err));
  });

  const container = results?.container;
  const initialObjects = container?.initialObjects;
  return {
    loading: !container,
    error,
    container,
    codePagesMap: initialObjects?.codePagesMap as SharedMap | undefined,
    sandpackObjectsMap: initialObjects?.sandpackObjectsMap as SharedMap | undefined,
    followModeState: initialObjects?.followModeState as EphemeralState<IFollowModeStateValue> | undefined,
    presence: initialObjects?.presence as EphemeralPresence | undefined,
    userDidCreateContainerRef,
  };
}

export const LiveShareContext = createContext<ILiveShareContext>({
  loading: true,
  error: undefined,
  container: undefined,
  codePagesMap: undefined,
  sandpackObjectsMap: undefined,
  followModeState: undefined,
  presence: undefined,
  userDidCreateContainerRef: undefined,
});

export const LiveShareProvider: FC<{
  children: ReactNode;
}> = ({children}) => {
  const liveShareValue = useLiveShare();

  return (
    <LiveShareContext.Provider value={liveShareValue}>
      <PageWrapper loading={liveShareValue.loading} error={liveShareValue.error}>
        { children }
      </PageWrapper>
    </LiveShareContext.Provider>
  )
}

export const useLiveShareContext = (): ILiveShareContext => {
  const liveShareContext = useContext(LiveShareContext);
  return liveShareContext;
}