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
import { useEffect, useRef, useState } from "react";
import { HeaderTemplate, LocalAppTemplate, TeamsAppTemplate, AFRAppTemplate } from "../../../../../sandpack-templates";
import { IFollowModeStateValue, ILiveShareContext } from "../../../../../models";
import { inTeams } from "../../../../../utils/inTeams";

/**
 * @hidden
 * Hook that creates/loads the apps shared objects.
 *
 * @remarks
 * This is an application specific hook that defines the fluid schema of Distributed Data Structures (DDS)
 * used by the app and passes that schema to the `TeamsFluidClient` to create/load your Fluid container.
 *
 * @see useLiveShareContext for consuming ILiveShareContext using React Context.
 * @returns Shared objects managed by the apps fluid container.
 */
export function useLiveShareContainer(): ILiveShareContext {
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
    const isInTeams = inTeams();

    let connection;
    if (!isInTeams) {
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
          // const AppTemplate = isInTeams ? TeamsAppTemplate : LocalAppTemplate;
          const AppTemplate = isInTeams ? TeamsAppTemplate : AFRAppTemplate;
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
