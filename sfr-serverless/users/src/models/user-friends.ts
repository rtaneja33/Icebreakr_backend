import * as mongoose from "mongoose";
import { IModelBase, SchemaBase, FriendRequestStatus } from "../../../common";

export interface IUserFriend extends IModelBase {
  userId: string;
  friendUserId: string;
  requestStatus: FriendRequestStatus;
  requestSendDate: Date;
  requestApprovedDate: Date
}

export const UserFriendSchemaName = "user_friends";

const UserFriendSchema = new mongoose.Schema(SchemaBase({
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true
  },
  friendUserId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true
  },
  requestStatus: String,
  requestSendDate: Date,
  requestApprovedDate: Date
}), { timestamps: true });

export const UserFriend = mongoose.model<IUserFriend>(
  UserFriendSchemaName, UserFriendSchema
);
