import { PresenceState, UserMeetingRole } from "@microsoft/live-share";
import { ICursor } from "./Cursor";

export interface IUser {
  userId: string;
  name: string;
  state: PresenceState;
  isLocal: boolean;
  currentPageKey?: string;
  cursor?: ICursor;
  roles?: UserMeetingRole[];
}
