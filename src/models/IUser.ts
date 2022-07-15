import { PresenceState, UserMeetingRole } from "@microsoft/live-share";

export interface IUser {
  userId: string;
  name: string;
  state: PresenceState;
  currentPageKey?: string;
  roles?: UserMeetingRole[];
}
