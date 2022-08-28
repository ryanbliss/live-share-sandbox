import {
  AzureClient,
  AzureConnectionConfig,
  AzureRemoteConnectionConfig,
} from "@fluidframework/azure-client";

import {
  ITokenProvider,
  ITokenResponse,
} from "@fluidframework/routerlicious-driver";
import {
  ContainerSchema,
  IFluidContainer,
  SharedMap,
  SharedString,
} from "fluid-framework";

/**
 * Token Provider implementation for connecting to an Azure Function endpoint for
 * Azure Fluid Relay token resolution.
 */
class AzureTokenProvider implements ITokenProvider {
  /**
   * Creates a new instance using configuration parameters.
   * @param azFunctionUrl - URL to Azure Function endpoint
   * @param user - User object
   */
  constructor(
    private readonly azFunctionUrl: string,
    private readonly user?: {
      id?: string;
      userName?: string;
      additionalDetails?: string;
    }
  ) {}

  public async fetchOrdererToken(
    tenantId: string,
    documentId?: string
  ): Promise<ITokenResponse> {
    return {
      jwt: await this.getToken(tenantId, documentId),
    };
  }

  public async fetchStorageToken(
    tenantId: string,
    documentId: string
  ): Promise<ITokenResponse> {
    return {
      jwt: await this.getToken(tenantId, documentId),
    };
  }

  private async getToken(
    tenantId: string,
    documentId: string | undefined
  ): Promise<string> {
    let url = this.azFunctionUrl + `&tenantId=${tenantId}`;
    if (documentId) {
      url += `&documentId=${documentId}`;
    }
    if (this.user?.id) {
      url += `&userId=${this.user.id}`;
    }
    if (this.user?.userName) {
      url += `&userName=${this.user.userName}`;
    }
    if (this.user?.additionalDetails) {
      url += `&additionalDetails=${this.user.additionalDetails}`;
    }
    const response = await fetch(url);
    const json = await response.json();
    const token = json.data.token;
    if (typeof token === "string") {
      return token;
    }
    throw new Error("AzureTokenProvider Invalid token response");
  }
}

function getConnection(userId: string): AzureConnectionConfig {
  const connection: AzureRemoteConnectionConfig = {
    type: "remote",
    tenantId: "7515b032-fde3-47f5-a7df-af436c5a8d5f",
    tokenProvider: new AzureTokenProvider(
      "https://codebox-live-functions.azurewebsites.net/api/codeboxfluidrelaytokenprovider?code=-6r5_0eWFpubsnUVGSOoW3hBj_SNWWBBV3MJufqCtg_kAzFuwd-c8w%3D%3D",
      {
        id: userId,
        userName: "Test",
      }
    ),
    endpoint: "https://us.fluidrelay.azure.com",
  };
  // West Europe
  // const connection: AzureRemoteConnectionConfig = {
  //   type: "remote",
  //   tenantId: "d6459b2a-61bc-474b-a43f-9faa6c1419d2",
  //   tokenProvider: new AzureTokenProvider(
  //     "https://codebox-live-functions.azurewebsites.net/api/codeboxfluidrelaytokenprovider?code=-6r5_0eWFpubsnUVGSOoW3hBj_SNWWBBV3MJufqCtg_kAzFuwd-c8w%3D%3D",
  //     {
  //       id: "123",
  //     }
  //   ),
  //   endpoint: "https://eu.fluidrelay.azure.com",
  // };
  // Local
  // const connection = {
  //   tenantId: "local",
  //   tokenProvider: new InsecureTokenProvider("", {
  //     id: "123",
  //   }),
  //   endpoint: "http://localhost:7070",
  // };
  return connection;
}

function getContainerSchema(): ContainerSchema {
  const schema: ContainerSchema = {
    initialObjects: {
      codePagesMap: SharedMap,
    },
    dynamicObjectTypes: [SharedMap, SharedString],
  };
  return schema;
}

export async function createAzureContainer(
  userId: string,
  getInitialFiles: (containerId: string) => Promise<Map<string, string>>
): Promise<{
  container: IFluidContainer;
  containerId: string;
  services: any;
  created: boolean;
}> {
  const connection = getConnection(userId);
  // Define container callback (optional).
  // * This is only called once when the container is first created.
  const onFirstInitialize = async (
    container: IFluidContainer,
    containerId: string
  ): Promise<void> => {
    console.log("azure-container-utils createNewContainer: onFirstInitialize");
    try {
      const initialFiles = await getInitialFiles(containerId);
      const keys = [...initialFiles.keys()];
      const codePagesMap = container.initialObjects.codePagesMap as SharedMap;
      for (let i = 0; i < initialFiles.size; i++) {
        const key = keys[i];
        const sharedString = await container.create(SharedString);
        codePagesMap.set(key, sharedString.handle);
        sharedString.insertText(0, initialFiles.get(key)!);
        console.log(key, sharedString.getText());
      }
      console.log(codePagesMap.size);
      return Promise.resolve();
    } catch (err: any) {
      console.error(err);
      return Promise.reject(err);
    }
  };

  const client = new AzureClient({
    connection,
  });
  const schema = getContainerSchema();
  const results = await client.createContainer(schema);
  const { container } = results;

  console.log("azure-container-utils createNewContainer: attaching");
  const connectedPromise = new Promise<void>((resolve) => {
    const onConnected = () => {
      container.off("connected", onConnected);
      resolve();
    };
    container.on("connected", onConnected);
  });
  // TODO: replace placeholder hardcoded template string with project ID
  await onFirstInitialize(container, "template");
  const containerId = await container.attach();
  console.log(
    "azure-container-utils createNewContainer: attached with id",
    containerId
  );
  await connectedPromise;
  console.log("azure-container-utils createNewContainer: connected");

  console.log("azure-container-utils createNewContainer: returning");
  return Promise.resolve({
    ...results,
    containerId,
    created: true,
  });
}

export async function getAzureContainer(
  userId: string,
  containerId: string
): Promise<
  | {
      container: IFluidContainer;
      services: any;
      created: boolean;
    }
  | undefined
> {
  const connection = getConnection(userId);

  const client = new AzureClient({
    connection,
  });
  const schema = getContainerSchema();
  const results = await client.getContainer(containerId, schema);
  return Promise.resolve({
    ...results,
    created: true,
  });
}
