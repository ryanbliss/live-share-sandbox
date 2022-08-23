import {
  IFluidTenantInfo,
  IFluidTokenRequestBody,
  IFluidTokenInfo,
  IFluidContainerInfo,
  ISetFluidContainerIdRequestBody,
  INtpTimeInfo,
  IUserRolesInfo,
  IUserRolesMessageBody,
  IRegisterClientIdInfo,
  IFluidRequests,
  UserRole,
} from "@codeboxlive/hub-interfaces";
import axios from "axios";

export class FluidService {
  constructor(private readonly userId: string) {}

  toFluidRequests(): IFluidRequests {
    return {
      getTenantInfo: this.getTenantInfo.bind(this),
      getFluidToken: this.getFluidToken.bind(this),
      getFluidContainerId: this.getFluidContainerId.bind(this),
      setFluidContainerId: this.setFluidContainerId.bind(this),
      getNtpTime: this.getNtpTime.bind(this),
      registerClientId: this.registerClientId.bind(this),
      getUserRoles: this.getUserRoles.bind(this),
    };
  }

  getTenantInfo(): Promise<IFluidTenantInfo> {
    const connection: IFluidTenantInfo = {
      type: "remote",
      tenantId: "7515b032-fde3-47f5-a7df-af436c5a8d5f",
      serviceEndpoint: "https://us.fluidrelay.azure.com",
    };
    return Promise.resolve(connection);
  }
  async getFluidToken(body: IFluidTokenRequestBody): Promise<IFluidTokenInfo> {
    let url =
      "https://codebox-live-functions.azurewebsites.net/api/codeboxfluidrelaytokenprovider?code=-6r5_0eWFpubsnUVGSOoW3hBj_SNWWBBV3MJufqCtg_kAzFuwd-c8w%3D%3D";
    if (body.containerId) {
      url += `&documentId=${body.containerId}`;
    }
    if (this.userId) {
      url += `&userId=${this.userId}`;
    }
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${this.userId}`,
      },
    });
    const token = response.data.data?.token;
    if (typeof token === "string") {
      return {
        token,
      };
    }
    throw Error("FluidService: unable to get token");
  }
  getFluidContainerId(): Promise<IFluidContainerInfo> {
    return Promise.reject(new Error("FluidService: not implemented exception"));
  }
  setFluidContainerId(
    body: ISetFluidContainerIdRequestBody
  ): Promise<IFluidContainerInfo> {
    return Promise.reject(new Error("FluidService: not implemented exception"));
  }
  getNtpTime(): Promise<INtpTimeInfo> {
    return Promise.resolve({
      ntpTime: new Date().toUTCString(),
      ntpTimeInUTC: new Date().getUTCDate(),
    });
  }
  async registerClientId(
    body: IUserRolesMessageBody
  ): Promise<IRegisterClientIdInfo> {
    return Promise.resolve({
      userRoles: [
        UserRole.organizer,
        UserRole.presenter,
        UserRole.attendee,
        UserRole.guest,
      ],
    });
  }
  async getUserRoles(body: IUserRolesMessageBody): Promise<IUserRolesInfo> {
    return Promise.resolve({
      userRoles: [
        UserRole.organizer,
        UserRole.presenter,
        UserRole.attendee,
        UserRole.guest,
      ],
    });
  }
}
