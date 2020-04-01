import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "../../models";
import { INotificationUser } from "./notification-user";

export enum ReferenceType {
  User = "user",
  Match = "match",
  Scorecard = "scorecard"
}

export interface INotification extends IModelBase {
  title: string;
  content: string;
  senderId: string;
  metadata: object;
  expiryDate: Date;

  type: ReferenceType;
  referenceId: string;
  referenceUrl: string;

  receivers?: INotificationUser[];
  reference?: any;
  sender: any;
}

export const NotificationSchemaName = "notifications";

const NotificationSchema = new mongoose.Schema(SchemaBase({
  title: String,
  content: String,
  senderId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true
  },
  metadata: Object,

  type: {
    type: String,
    require: true
  },
  referenceId: mongoose.SchemaTypes.ObjectId,
  referenceUrl: String,
  expiryDate: Date

}), {
  timestamps: true
});

export const Notification = mongoose.model<INotification>(NotificationSchemaName, NotificationSchema);
