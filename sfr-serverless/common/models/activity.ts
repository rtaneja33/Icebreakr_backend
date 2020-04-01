import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "./common";

export enum ActivityType {
    LOGIN = "login",
    LOGOUT = "logout",
    DELETE = "delete",
    DEACTIVATE = "deactivate",
    REACTIVATE = "reactivate",
    SIGNUP = "signup",
    BLOCK = "block",
    REPORT = "report"
}

export interface IAccountActivity extends IModelBase {
  activityType: ActivityType;
  affectedUser: string;
}

export const AccountActivitySchemaName = "account_activities";

const AccountActivitySchema = new mongoose.Schema(SchemaBase({
  activityType: {
    type: String,
  },
  affectedUser: {
    type: mongoose.SchemaTypes.ObjectId,
  },
}), { timestamps: true });

export const AccountActivity = mongoose.model<IAccountActivity>(
  AccountActivitySchemaName, AccountActivitySchema
);
