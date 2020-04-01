import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "./common";

export interface IUserSuggestions extends IModelBase {
  suggestions: string;
}

export const UserSuggestionsSchemaName = "user_suggestions";

const UserSuggestionSchema = new mongoose.Schema(SchemaBase({
  suggestions: String
}), { timestamps: true });

export const UserSuggestion = mongoose.model<IUserSuggestions>(
  UserSuggestionsSchemaName, UserSuggestionSchema
);
