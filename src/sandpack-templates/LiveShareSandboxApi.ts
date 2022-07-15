export const LiveShareSandboxApi = `
import { EventEmitter } from "events";
import {
  SharedDirectory,
  SharedMap,
  SharedString,
} from "fluid-framework";
import { TeamsFluidClient as LiveShareTeamsFluidClient, EphemeralState, EphemeralEvent, EphemeralPresence } from "@microsoft/live-share";
import { EphemeralMediaSession } from "@microsoft/live-share-media";


class SandboxFluidContainer extends EventEmitter {
  connectedHandler = () => this.emit("connected");
  disconnectedHandler = () => this.emit("disconnected");
  disposedHandler = () => this.emit("disposed");
  savedHandler = () => this.emit("saved");
  dirtyHandler = () => this.emit("dirty");

  constructor(container, overrideInitialObjects) {
    super();
    this.container = container;
    this.overrideInitialObjects = overrideInitialObjects;
    this.container.on("connected", this.connectedHandler);
    this.container.on("closed", this.disposedHandler);
    this.container.on("disconnected", this.disconnectedHandler);
    this.container.on("saved", this.savedHandler);
    this.container.on("dirty", this.dirtyHandler);
  }

  get isDirty() {
    return this.container.isDirty;
  }

  get attachState() {
    return this.container.attachState;
  }

  get disposed() {
    return this.container.closed;
  }

  get connected() {
    return this.container.connected;
  }

  get connectionState() {
    return this.container.connectionState;
  }

  get initialObjects() {
    return this.overrideInitialObjects;
  }

  async attach() {
    throw new Error(
      "Cannot attach container. Container is not in detached state"
    );
  }

  async connect() {
    this.container.connect?.();
  }

  async disconnect() {
    this.container.disconnect?.();
  }

  async create(objectClass) {
    return this.container.create(objectClass);
  }

  dispose() {
    this.container.close();
    this.container.off("connected", this.connectedHandler);
    this.container.off("closed", this.disposedHandler);
    this.container.off("disconnected", this.disconnectedHandler);
    this.container.off("saved", this.savedHandler);
    this.container.off("dirty", this.dirtyHandler);
  }
}

export class TeamsFluidClient extends LiveShareTeamsFluidClient {
  async joinContainer(fluidContainerSchema, onContainerFirstCreated) {
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
        SharedString,
        EphemeralPresence,
        EphemeralMediaSession,
        EphemeralEvent,
        SharedDirectory,
      ],
    };

    const overrideInitialObjects = {};
    let isOnFirstInitialize = false;

    const onFirstInitialize = (container) => {
      isOnFirstInitialize = true;
      Object.keys(fluidContainerSchema.initialObjects).forEach((key) => {
        container
          .create(fluidContainerSchema.initialObjects[key])
          .then((dds) => {
            container.initialObjects.sandpackObjectsMap.set(key, dds.handle);
          })
          .catch((error) => console.error(error));
      });
    };
    const results = await super.joinContainer(schema, onFirstInitialize);
    const { container, services, created } = results;

    return new Promise((resolve) => {
      container.initialObjects.sandpackObjectsMap.on(
        "valueChanged",
        (changed, local) => {
          const value = container.initialObjects.sandpackObjectsMap.get(
            changed.key
          );
          overrideInitialObjects[changed.key] = value;
          if (
            Object.keys(overrideInitialObjects).length ===
            Object.keys(fluidContainerSchema.initialObjects).length
          ) {
            const sandboxContainer = new SandboxFluidContainer(
              container,
              overrideInitialObjects
            );
            if (isOnFirstInitialize) {
              onContainerFirstCreated(sandboxContainer);
            }
            resolve({
              container: sandboxContainer,
              services,
              created,
            });
          }
        }
      );
    });
  }
}
`;
