import { INotificationUser } from "../../../common";

export interface INotificationItemAdminResponse {
  id: string;
  content: string;
  createdAt: Date;
  metadata: object;
  expiryDate: Date;
}

export function serializeNotificationItemAdmin(model: INotificationUser): INotificationItemAdminResponse {
  return {
    id: model.notification._id,
    content: model.notification.content,
    createdAt: model.createdAt,
    metadata: model.notification.metadata,
    expiryDate: model.notification.expiryDate
  };
}
