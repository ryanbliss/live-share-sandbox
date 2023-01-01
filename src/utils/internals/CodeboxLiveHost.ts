import {
  IFluidContainerInfo,
  IFluidTenantInfo,
  ILiveShareHost,
  INtpTimeInfo,
  UserMeetingRole,
} from "@microsoft/live-share";
import { FluidService } from "../../service";

export class CodeboxLiveHost implements ILiveShareHost {
  private _fluidService: FluidService;
  constructor(fluidService: FluidService) {
    this._fluidService = fluidService;
  }
  getFluidTenantInfo(): Promise<IFluidTenantInfo> {
    throw new Error("Method not implemented.");
  }
  getFluidToken(containerId?: string | undefined): Promise<string> {
    throw new Error("Method not implemented.");
  }
  getFluidContainerId(): Promise<IFluidContainerInfo> {
    throw new Error("Method not implemented.");
  }
  setFluidContainerId(containerId: string): Promise<IFluidContainerInfo> {
    throw new Error("Method not implemented.");
  }
  getNtpTime(): Promise<INtpTimeInfo> {
    return this._fluidService.getNtpTime();
  }
  registerClientId(clientId: string): Promise<UserMeetingRole[]> {
    throw new Error("Method not implemented.");
  }
  getClientRoles(clientId: string): Promise<UserMeetingRole[] | undefined> {
    throw new Error("Method not implemented.");
  }
}
