import * as mongoose from "mongoose";
import { IModelBase } from "./common";
import { UserSchemaName } from "./user";

export interface IPushNotification extends IModelBase {
  userId: boolean;
  response: Object;
  registrationToken: string;
  payload: Object;
  options: Object;
}

export const NotificationSchemaName = "notifications";

const NotificationSchema = new mongoose.Schema({
  payload: Object,
  options: Object,
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: UserSchemaName
  },
  registrationToken: String,
  response: Object
}, {
  timestamps: true
});

export const PushNotifications = mongoose.model<IPushNotification>(NotificationSchemaName, NotificationSchema);
