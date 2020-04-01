import { IUser } from "../models";

export interface ISimpleUserResponse {
  id: string;
  avatar: string;
  displayName: string;
  email: string;
}

export function serializeSimpleUser(model: IUser): ISimpleUserResponse {
  if (!model) {
    return null;
  }

  return {
    id: model._id || model.id,
    avatar: model.avatar,
    email: model.email,
    displayName: model.displayName,
  };
}
