/*!
 * Copyright (c) Ryan Bliss. All rights reserved.
 * Licensed under the MIT License.
 */
import {
  AzureClient,
  AzureConnectionConfig,
} from "@fluidframework/azure-client";
import { ContainerSchema, IFluidContainer, SharedMap } from "fluid-framework";
import { SharedString } from "@fluidframework/sequence";
import { useEffect, useRef, useState } from "react";
import {
  HeaderTemplate,
  TeamsAppTemplate,
  AFRAppTemplate,
} from "../../../../../sandpack-templates";
import { IFluidContainerResults } from "../../../../../models";
import { inTeams } from "../../../../../utils/inTeams";
import { AzureTokenProvider } from "./internals/AzureTokenProvider";
import { useParams, useSearchParams } from "react-router-dom";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";

/**
 * @hidden
 * Hook that creates/loads the apps shared objects.
 *
 * @remarks
 * This is an application specific hook that defines the fluid schema of Distributed Data Structures (DDS)
 * used by the app and passes that schema to the `TeamsFluidClient` to create/load your Fluid container.
 *
 * @see useFluidObjectsContext for consuming ILiveShareContext using React Context.
 * @returns Shared objects managed by the apps fluid container.
 */
export function useFluidContainerResults(): IFluidContainerResults {
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
  const initializedRef = useRef<boolean>(false);
  const [params] = useSearchParams();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    // Define container schema
    const schema: ContainerSchema = {
      initialObjects: {
        codePagesMap: SharedMap,
      },
      dynamicObjectTypes: [SharedMap, SharedString],
    };
    const start = async () => {
      console.log("useSharedObjects: starting");
      // Define custom connection for local testing
      // West US 2
      // const connection: AzureConnectionConfig = {
      //   tenantId: "7515b032-fde3-47f5-a7df-af436c5a8d5f",
      //   tokenProvider: new AzureTokenProvider(
      //     "https://codebox-live-functions.azurewebsites.net/api/codeboxfluidrelaytokenprovider?code=-6r5_0eWFpubsnUVGSOoW3hBj_SNWWBBV3MJufqCtg_kAzFuwd-c8w%3D%3D",
      //     {
      //       id: "123",
      //       userName: "Test",
      //     }
      //   ),
      //   orderer: "https://alfred.westus2.fluidrelay.azure.com",
      //   storage: "https://historian.westus2.fluidrelay.azure.com",
      // };
      // West Europe
      const connection = {
        tenantId: "d6459b2a-61bc-474b-a43f-9faa6c1419d2",
        tokenProvider: new AzureTokenProvider(
          "https://codebox-live-functions.azurewebsites.net/api/codeboxfluidrelaytokenprovider?code=-6r5_0eWFpubsnUVGSOoW3hBj_SNWWBBV3MJufqCtg_kAzFuwd-c8w%3D%3D",
          {
            id: "123",
          }
        ),
        orderer: "https://alfred.westeurope.fluidrelay.azure.com",
        storage: "https://historian.westeurope.fluidrelay.azure.com",
      };
      // Local
      // const connection = {
      //   tenantId: "local",
      //   tokenProvider: new InsecureTokenProvider("", {
      //     id: "123",
      //   }),
      //   orderer: "http://localhost:7070",
      //   storage: "http://localhost:7070",
      // };

      // Define container callback (optional).
      // * This is only called once when the container is first created.
      const onFirstInitialize = async (
        container: IFluidContainer
      ): Promise<void> => {
        console.log("useFluidContainerResults onFirstInitialize");
        userDidCreateContainerRef.current = true;
        try {
          const appTemplateString = await container.create(SharedString);
          (container.initialObjects.codePagesMap as SharedMap).set(
            "/App.tsx",
            appTemplateString.handle
          );
          // const AppTemplate = isInTeams ? TeamsAppTemplate : LocalAppTemplate;
          const AppTemplate = inTeams() ? TeamsAppTemplate : AFRAppTemplate;
          appTemplateString.insertText(0, AppTemplate);
          const headerString = await container.create(SharedString);
          (container.initialObjects.codePagesMap as SharedMap).set(
            "/Header.tsx",
            headerString.handle
          );
          headerString.insertText(0, HeaderTemplate);
          return Promise.resolve();
        } catch (err: any) {
          console.error(err);
          return Promise.reject(err);
        }
      };
      const client = new AzureClient({
        connection,
      });

      try {
        const containerId = params.get("containerId");
        if (!containerId) {
          console.log("useFluidContainerResults creating container");
          const results = await client.createContainer(schema);
          const { container } = results;
          await onFirstInitialize(container);
          console.log("useFluidContainerResults attaching");
          const _containerId = await container.attach();
          console.log("useFluidContainerResults containerId", _containerId);
          setResults({
            ...results,
            created: true,
          });
        } else {
          console.log("useFluidContainerResults get container", containerId);
          const results = await client.getContainer(containerId, schema);
          setResults({
            ...results,
            created: false,
          });
        }
      } catch (err: any) {
        console.error(err);
        setError(err);
      }
    };
    start();
  });

  const container = results?.container;
  const initialObjects = container?.initialObjects;
  return {
    loading: !container,
    error,
    container,
    codePagesMap: initialObjects?.codePagesMap as SharedMap | undefined,
    userDidCreateContainerRef,
  };
}
