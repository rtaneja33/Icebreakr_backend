import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "./common";

export interface IUserQuestion extends IModelBase {
  questions: string;
  email: string;
}

export const UserQuestionSchemaName = "user_questions";

const UserQuestionSchema = new mongoose.Schema(SchemaBase({
  questions: String,
  email: String
}), { timestamps: true });

export const UserQuestion = mongoose.model<IUserQuestion>(
  UserQuestionSchemaName, UserQuestionSchema
);
