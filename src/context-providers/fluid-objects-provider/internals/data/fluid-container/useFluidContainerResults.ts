/*!
 * Copyright (c) Ryan Bliss. All rights reserved.
 * Licensed under the MIT License.
 */
import { IFluidContainer, SharedMap } from "fluid-framework";
import { useEffect, useRef, useState } from "react";
import { IFluidContainerResults } from "../../../../../models";
import { useParams, useSearchParams } from "react-router-dom";
import { getAzureContainer } from "../../../../../utils";
import { useTeamsClientContext } from "../../../../teams-client-provider";

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
  const initializedRef = useRef<boolean>(false);
  const params = useParams();
  const { teamsContext } = useTeamsClientContext();

  useEffect(() => {
    const teamsUserId = teamsContext?.user?.id;
    if (initializedRef.current || !teamsUserId) {
      return;
    }
    initializedRef.current = true;
    const start = async () => {
      console.log("useSharedObjects: starting");

      try {
        const containerId = params["containerId"];
        if (containerId) {
          console.log("useFluidContainerResults creating container");
          const results = await getAzureContainer(teamsUserId, containerId);
          setResults(results);
        } else {
          initializedRef.current = true;
        }
      } catch (err: any) {
        console.error(err);
        setError(err);
      }
    };
    start();
  }, [teamsContext]);

  useEffect(() => {
    return () => {
      results?.container.disconnect?.();
    };
  }, [results]);

  const container = results?.container;
  const initialObjects = container?.initialObjects;

  return {
    loading: !container,
    error,
    container,
    codePagesMap: initialObjects?.codePagesMap as SharedMap | undefined,
  };
}
