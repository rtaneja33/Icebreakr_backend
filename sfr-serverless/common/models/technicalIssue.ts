import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "./common";

export interface ITechnicalIssues extends IModelBase {
  issue: string;
}

export const TechnicalIssuesSchemaName = "technical_issues";

const TechnicalIssuesSchema = new mongoose.Schema(SchemaBase({
  issue: String
}), { timestamps: true });

export const TechnicalIssue = mongoose.model<ITechnicalIssues>(
  TechnicalIssuesSchemaName, TechnicalIssuesSchema
);
