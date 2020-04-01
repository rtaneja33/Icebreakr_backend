import {
  IOptions,
  IUser, Notification,
  ReferenceType, User
} from "../../../common";
import { serializerUser } from "../serializers";
import { parseProfiles } from "./user";

export async function parseMyNotification(ids: string[], options: IOptions) {
  try {
    const notifications = await Notification.find({ _id: ids }).sort({ createdAt: -1 });
    const senderIds = notifications.map((e) => e.senderId);
    const userIds = notifications
      .filter((e) => e.type === ReferenceType.User)
      .map((e) => e.referenceId)
      .concat(senderIds);
    let users: IUser[] = [];
    let matches = [];

    if (userIds.length > 0) {
      users = await User.find({ _id: userIds });
      users = await parseProfiles(users);
    }
    
    return notifications.map((e) => {
      console.log("tt: ", users.find((u) => u._id.toString() === e.senderId.toString()));
      e.sender = users.find((u) => u._id.toString() === e.senderId.toString());
      if (e.type === ReferenceType.User && users.length > 0) {
        e.reference = serializerUser(users.find((u) => u._id.toString() === e.referenceId.toString()));
        return e;
      }
      if((e.type === ReferenceType.Match || e.type === ReferenceType.Scorecard) && matches != null) {
        // e.reference = match;
        
        e.reference = matches.find((m) => m.matchInfo._id.toString() === e.referenceId.toString());
        return e;
      }

      return e;
    });
  } catch (error) {
    return Promise.reject(error);
  }
}
