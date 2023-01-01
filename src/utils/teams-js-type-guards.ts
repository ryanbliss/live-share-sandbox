import { SdkError, ErrorCode } from "@microsoft/teams-js";

export const isSdkError = (value: any): value is SdkError => {
  return typeof value?.errorCode === "number" && value.errorCode in ErrorCode;
};
