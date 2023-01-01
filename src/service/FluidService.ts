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
  ContainerState,
} from "@codeboxlive/hub-interfaces";
import axios from "axios";
import { IProject } from "../models";
import { ProjectsService } from "./ProjectsService";

function isTenantInfo(value: any): value is IFluidTenantInfo {
  return [
    typeof value?.tenantId === undefined || typeof value?.tenantId === "string",
    value?.type === "remote" || value?.type === "local",
    typeof value?.serviceEndpoint === "string",
  ].every((isTrue) => isTrue);
}

function isNptTime(value: any): value is INtpTimeInfo {
  return [
    typeof value?.ntpTime === "string",
    typeof value?.ntpTimeInUTC === "number",
  ].every((isTrue) => isTrue);
}

export class FluidService {
  constructor(
    private readonly userId: string,
    private readonly currentProject: IProject,
    private readonly projectService: ProjectsService
  ) {}

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

  async getTenantInfo(): Promise<IFluidTenantInfo> {
    const url =
      "https://codebox-live-functions-west-us.azurewebsites.net/api/codeboxgetfluidtenantinfo?code=-2r7wfX8PTJnTANzrX_uL_xOmCH8slUduqehEF_XWgDoAzFuYY3pOQ%3D%3D";
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${this.userId}`,
      },
    });
    const tenantInfo = response.data.data;
    if (isTenantInfo(tenantInfo)) {
      return {
        ...tenantInfo,
        // Return empty strings for deprecated endpoints
        ordererEndpoint: "",
        storageEndpoint: "",
      };
    }
    throw Error("FluidService.getTenantInfo: invalid response");
  }
  async getFluidToken(body: IFluidTokenRequestBody): Promise<IFluidTokenInfo> {
    let url =
      "https://codebox-live-functions-west-us.azurewebsites.net/api/codeboxfluidrelaytokenprovider?code=t5XKUSQTfdAOPwUyaVwhIq7JukmNU02NqPvZD0sV3D3vAzFuN26gWQ%3D%3D";
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
    throw Error("FluidService.getFluidToken: invalid response");
  }
  async getFluidContainerId(): Promise<IFluidContainerInfo> {
    console.log(this.currentProject.sandboxContainerId);
    if (this.currentProject.sandboxContainerId) {
      return Promise.resolve({
        containerId: this.currentProject.sandboxContainerId,
        shouldCreate: false,
        containerState: ContainerState.alreadyExists,
        retryAfter: 100,
      });
    }
    const project = await this.projectService.getProject(
      this.currentProject._id
    );
    const shouldCreate = !project.sandboxContainerId;
    return {
      containerId: project.sandboxContainerId,
      shouldCreate: !project.sandboxContainerId,
      containerState: shouldCreate
        ? ContainerState.notFound
        : ContainerState.alreadyExists,
      retryAfter: 100,
    };
  }
  async setFluidContainerId(
    body: ISetFluidContainerIdRequestBody
  ): Promise<IFluidContainerInfo> {
    if (this.currentProject.sandboxContainerId) {
      return Promise.resolve({
        containerId: this.currentProject.sandboxContainerId,
        shouldCreate: false,
        containerState: ContainerState.alreadyExists,
        retryAfter: 100,
      });
    }
    const project = await this.projectService.setProject({
      _id: this.currentProject._id,
      sandboxContainerId: body.containerId,
    });
    return {
      containerId: project.sandboxContainerId,
      shouldCreate: !project.sandboxContainerId,
      containerState: ContainerState.added,
      retryAfter: 100,
    };
  }
  async getNtpTime(): Promise<INtpTimeInfo> {
    const url =
      "https://codebox-live-functions-west-us.azurewebsites.net/api/codeboxgetnpttime?code=sOuwBFOeDqiH5O19Yo7h4ril_tTz1LtoxgJK5yfGrUw_AzFuD0kpQw%3D%3D";
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${this.userId}`,
      },
    });
    const info = response.data.data;
    if (isNptTime(info)) {
      return info;
    }
    throw Error("FluidService.getNtpTime: invalid response");
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
