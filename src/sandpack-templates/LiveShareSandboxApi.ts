export const LiveShareSandboxApi = `
import { SharedDirectory, SharedMap } from "@fluidframework/map";
import {
  IFluidContainer,
  IFluidContainerEvents,
  LoadableObjectRecord,
  ContainerSchema,
  LoadableObjectClass,
} from "@fluidframework/fluid-static";
import { TypedEventEmitter } from "@fluidframework/common-utils";
import {
  AttachState,
  ConnectionState,
} from "@fluidframework/container-definitions";
import { IFluidLoadable } from "@fluidframework/core-interfaces";
import { AzureContainerServices } from "@fluidframework/azure-client";
import { LOCAL_MODE_TENANT_ID } from "@fluidframework/azure-client";
// import { SharedString } from "@fluidframework/sequence";
import {
  TeamsFluidClient as LiveShareTeamsFluidClient,
  EphemeralState,
  EphemeralEvent,
  EphemeralPresence,
  ITeamsFluidClientOptions,
} from "@microsoft/live-share";
import { EphemeralMediaSession } from "@microsoft/live-share-media";
import { WindowMessagingApi } from "./WindowMessagingApi";

export class SandboxFluidContainer
  extends TypedEventEmitter<IFluidContainerEvents>
  implements IFluidContainer
{
  private readonly connectedHandler = () => this.emit("connected");
  private readonly disconnectedHandler = () => this.emit("disconnected");
  private readonly disposedHandler = () => this.emit("disposed");
  private readonly savedHandler = () => this.emit("saved");
  private readonly dirtyHandler = () => this.emit("dirty");
  private container: IFluidContainer;
  private overrideInitialObjects: LoadableObjectRecord;

  constructor(
    container: IFluidContainer,
    overrideInitialObjects: LoadableObjectRecord
  ) {
    super();
    this.container = container;
    this.overrideInitialObjects = overrideInitialObjects;
    this.container.on("connected", this.connectedHandler);
    this.container.on("dispose", this.disposedHandler);
    this.container.on("disconnected", this.disconnectedHandler);
    this.container.on("saved", this.savedHandler);
    this.container.on("dirty", this.dirtyHandler);
  }

  /**
   * {@inheritDoc IFluidContainer.isDirty}
   */
  public get isDirty(): boolean {
    return this.container.isDirty;
  }

  /**
   * {@inheritDoc IFluidContainer.attachState}
   */
  public get attachState(): AttachState {
    return this.container.attachState;
  }

  /**
   * {@inheritDoc IFluidContainer.disposed}
   */
  public get disposed() {
    return this.container.disposed;
  }

  /**
   * {@inheritDoc IFluidContainer.connected}
   */
  public get connected() {
    return this.container.connected;
  }

  /**
   * {@inheritDoc IFluidContainer.connectionState}
   */
  public get connectionState(): ConnectionState {
    return this.container.connectionState;
  }

  /**
   * {@inheritDoc IFluidContainer.initialObjects}
   */
  get initialObjects() {
    return this.overrideInitialObjects;
  }

  /**
   * {@inheritDoc IFluidContainer.attach}
   */
  public async attach() {
    return this.container.attach();
  }

  /**
   * {@inheritDoc IFluidContainer.connect}
   */
  public async connect(): Promise<void> {
    this.container.connect?.();
  }

  /**
   * {@inheritDoc IFluidContainer.connect}
   */
  public async disconnect(): Promise<void> {
    this.container.disconnect?.();
  }

  /**
   * {@inheritDoc IFluidContainer.create}
   */
  async create<T extends IFluidLoadable>(
    objectClass: LoadableObjectClass<T>
  ): Promise<T> {
    return this.container.create(objectClass);
  }

  /**
   * {@inheritDoc IFluidContainer.dispose}
   */
  dispose() {
    this.container.dispose();
  }
}

export class TeamsFluidClient extends LiveShareTeamsFluidClient {
  private testContainerId: string | undefined;
  constructor(options?: ITeamsFluidClientOptions) {
    let overrideOptions: ITeamsFluidClientOptions | undefined = options
      ? Object.assign({}, options)
      : undefined;
    if (
      options?.connection?.tenantId === LOCAL_MODE_TENANT_ID &&
      !options?.getLocalTestContainerId
    ) {
      (overrideOptions = {
        getLocalTestContainerId: (): string | undefined => {
          console.log("containerId 2", this.testContainerId);
          return this.testContainerId;
        },
        setLocalTestContainerId: (containerId: string): Promise<void> => {
          const errorText =
            "We should never be setting a test container in Sandpack. Container" +
            containerId +
            " not set.";
          throw new Error(errorText);
        },
        connection: options.connection,
      }),
        console.log(overrideOptions);
    }
    super(overrideOptions);
  }

  async joinContainer(
    fluidContainerSchema: ContainerSchema,
    onContainerFirstCreated?: (container: IFluidContainer) => void
  ): Promise<{
    container: IFluidContainer;
    services: AzureContainerServices;
    created: boolean;
  }> {
    if (this.isTesting) {
      this.testContainerId = await this.getTestContainerIdFromParent();
      console.log("testContainerId received from parent", this.testContainerId);
    }
    // Define container schema
    const schema = {
      initialObjects: {
        codePagesMap: SharedMap,
        sandpackObjectsMap: SharedMap,
        followModeState: EphemeralState,
        presence: EphemeralPresence,
      },
      dynamicObjectTypes: [
        SharedMap,
        EphemeralPresence,
        EphemeralMediaSession,
        EphemeralEvent,
        SharedDirectory,
      ],
    };

    const overrideInitialObjectHandles: any = {};
    let listener: any;

    const getSandboxContainerResults = async (
      sandpackObjectsMap: SharedMap,
      container: IFluidContainer
    ): Promise<{
      container: IFluidContainer;
      services: AzureContainerServices;
      created: boolean;
    }> => {
      console.log("getSandboxContainerResults");
      const overrideInitialObjects: any = {};
      const keys = Object.keys(overrideInitialObjectHandles);
      for (
        let handleKeyIndex = 0;
        handleKeyIndex < keys.length;
        handleKeyIndex++
      ) {
        const handleKey = keys[handleKeyIndex];
        const handle = overrideInitialObjectHandles[handleKey];
        const value = handle.value ?? (await handle.get());
        overrideInitialObjects[handleKey] = value;
      }
      const sandboxContainer = new SandboxFluidContainer(
        container,
        overrideInitialObjects
      );
      if (listener) {
        sandpackObjectsMap.off("valueChanged", listener);
      }
      return {
        container: sandboxContainer,
        services,
        created,
      };
    };
    const results = await super.joinContainer(schema);
    console.log("Joined container");
    const { container, services, created } = results;

    return new Promise(async (resolve) => {
      const sandpackObjectsMap = container.initialObjects
        .sandpackObjectsMap as SharedMap;
      const keys = Object.keys(fluidContainerSchema.initialObjects);
      const targetInitialObjectsLength = Object.keys(
        fluidContainerSchema.initialObjects
      ).length;
      const startingLength = [...sandpackObjectsMap.entries()].length;
      console.log(startingLength, targetInitialObjectsLength);

      // TODO: need to check if user is the presenter or some other mechanism for who to create these
      if (startingLength < targetInitialObjectsLength) {
        console.log("Creating initial sandpackObjectsMap values");
        // We need to set the Sandpack initial objects to the sandpackObjectsMap
        for (
          let createIndex = 0;
          createIndex < targetInitialObjectsLength;
          createIndex++
        ) {
          const key = keys[createIndex];
          const dds = await container.create(
            fluidContainerSchema.initialObjects[key]
          );
          sandpackObjectsMap.set(key, dds.handle);
          const handle = sandpackObjectsMap.get(key);
          if (handle) {
            overrideInitialObjectHandles[key] = handle;
          }
        }
        if (!!onContainerFirstCreated) {
          onContainerFirstCreated(container);
        }
      } else if (startingLength > 0) {
        console.log("Using existing sandpackObjectsMap values");
        sandpackObjectsMap.forEach((handle, key) => {
          overrideInitialObjectHandles[key] = handle;
        });
      }
      if (
        Object.keys(overrideInitialObjectHandles).length ===
        targetInitialObjectsLength
      ) {
        const sandpackResults = await getSandboxContainerResults(
          sandpackObjectsMap,
          container
        );
        resolve(sandpackResults);
      } else {
        listener = async (changed: any, local: boolean, map: SharedMap) => {
          console.log("sandpackObjectsMap changed", changed.key);
          const handle = await map.get(changed.key);
          if (handle) {
            overrideInitialObjectHandles[changed.key] = handle;
            if (
              Object.keys(overrideInitialObjectHandles).length ===
              targetInitialObjectsLength
            ) {
              const sandpackResults = await getSandboxContainerResults(
                sandpackObjectsMap,
                container
              );
              resolve(sandpackResults);
            }
          }
        };
        sandpackObjectsMap.on("valueChanged", listener);
      }
    });
  }

  private getTestContainerIdFromParent(): Promise<string> {
    return new Promise(async (resolve) => {
      const containerId: string = await WindowMessagingApi.sendRequest<string>(
        "getContainerId"
      );
      resolve(containerId);
    });
  }
}
`;
