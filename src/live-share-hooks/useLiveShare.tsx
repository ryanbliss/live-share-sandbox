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
  SharedString,
} from "fluid-framework";
import { useEffect, useState } from "react";
import { AppTemplate, HeaderTemplate } from "../sandpack-templates";
import { IFollowModeStateValue } from "./plugins/useFollowModeState";

/**
 * Hook that creates/loads the apps shared objects.
 *
 * @remarks
 * This is an application specific hook that defines the fluid schema of Distributed Data Structures (DDS)
 * used by the app and passes that schema to the `TeamsFluidClient` to create/load your Fluid container.
 *
 * @returns Shared objects managed by the apps fluid container.
 */
export function useLiveShare(): {
  loading: boolean;
  error: Error | undefined;
  container: IFluidContainer | undefined;
  codePagesMap: SharedMap | undefined;
  sandpackObjectsMap: SharedMap | undefined;
  followModeState:
    | EphemeralState<IFollowModeStateValue>
    | undefined;
  presence: EphemeralPresence | undefined;
} {
  const [results, setResults] = useState<
    | {
        container: IFluidContainer;
        services: any;
        created: boolean;
      }
    | undefined
  >();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
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
    };

    // To reset the stored container-id, uncomment below:
    // localStorage.clear();

    // Enable debugger
    window.localStorage.debug = "fluid:*";

    // Define container callback (optional).
    // * This is only called once when the container is first created.
    const onFirstInitialize = (container: IFluidContainer) => {
      console.log("useSharedObjects: onFirstInitialize called");
      container
        .create(SharedString)
        .then((sharedString) => {
          (container.initialObjects.codePagesMap as SharedMap).set(
            "/App.js",
            sharedString.handle
          );
          sharedString.insertText(0, AppTemplate);
        })
        .catch((error) => setError(error));
      container
        .create(SharedString)
        .then((sharedString) => {
          (container.initialObjects.codePagesMap as SharedMap).set(
            "/Header.js",
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
  }, []);

  const container = results?.container;
  const initialObjects = container?.initialObjects;
  return {
    loading: !container,
    error,
    container,
    codePagesMap: initialObjects
      ? (initialObjects?.codePagesMap as SharedMap)
      : undefined,
    sandpackObjectsMap: initialObjects
      ? (initialObjects?.sandpackObjectsMap as SharedMap)
      : undefined,
    followModeState: initialObjects
      ? (initialObjects?.followModeState as EphemeralState<IFollowModeStateValue>)
      : undefined,
    presence: initialObjects
      ? (initialObjects?.presence as EphemeralPresence)
      : undefined,
  };
}
