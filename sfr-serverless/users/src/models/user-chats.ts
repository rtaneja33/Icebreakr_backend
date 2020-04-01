import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "../../../common";

export interface IUserChat extends IModelBase {
  toUserId: string;
  message: string;
}

export const UserChatSchemaName = "user_chats";

const UserChatSchema = new mongoose.Schema(SchemaBase({
  toUserId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true
  },
  message: String
}), { timestamps: true });

export const UserChat = mongoose.model<IUserChat>(
  UserChatSchemaName, UserChatSchema
);
