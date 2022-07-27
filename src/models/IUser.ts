import { PresenceState, UserMeetingRole } from "@microsoft/live-share";
import { ICursor } from "./Cursor";

export interface IUser {
  userId: string;
  name: string;
  state: PresenceState;
  currentPageKey?: string;
  cursor?: ICursor;
  roles?: UserMeetingRole[];
}
