import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "./common";

export interface IBillingIssues extends IModelBase {
  issue: string;
}

export const BillingIssuesSchemaName = "billing_issues";

const BillingIssuesSchema = new mongoose.Schema(SchemaBase({
  issue: String
}), { timestamps: true });

export const BillingIssue = mongoose.model<IBillingIssues>(
  BillingIssuesSchemaName, BillingIssuesSchema
);
