import {
  ITokenProvider,
  ITokenResponse,
} from "@fluidframework/routerlicious-driver";

/**
 * Token Provider implementation for connecting to an Azure Function endpoint for
 * Azure Fluid Relay token resolution.
 */
export class AzureTokenProvider implements ITokenProvider {
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
    console.log(url);
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
      console.log(token, tenantId, documentId);
      return token;
    }
    throw new Error("AzureTokenProvider Invalid token response");
  }
}
