import {
  serializeSimpleUser, INotification,
  ISimpleUserResponse, ReferenceType
} from "../../../common";

export interface INotificationItemResponse {
  id: string;
  type: ReferenceType;
  title: string;
  content: string;
  referenceId: string;
  reference: any;
  createdAt: Date;
  sender: ISimpleUserResponse;
  metadata: object;
}

export function serializerNotificationItem(model: INotification): INotificationItemResponse {
  return {
    id: model._id,
    type: model.type,
    sender: serializeSimpleUser(model.sender),
    reference: model.reference,
    createdAt: model.createdAt,
    title: model.title,
    referenceId: model.referenceId,
    metadata: model.metadata,
    content: model.content,
  };
}
