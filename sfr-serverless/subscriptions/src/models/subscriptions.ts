import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "../../../common";

export interface ISubscriptionFormCreate {
  name: string;
  type: string;
  description: string;
  duration?: Number;
  interval: Interval;
  amount: string;
  benefits?: string[];
  createdBy: string;
  stripeId: string;
}

export enum Interval {
  MONTHLY = "monthly",
  WEEKLY = "weekly",
  UNLIMITED = "unlimited"
}

export enum SubscriptionType {
  PLAN = "plan",
  PRODUCT = "product"
}

export interface ISubscription extends IModelBase {
  name: string;
  type: string;
  description: string;
  duration: Number;
  amount: string;
  benefits: string[];
  stripeId: string;
  interval: Interval;
  freeSurfs: Number;
}

export const SubscriptionsSchemaName = "subscriptions";

const SubscriptionsSchema = new mongoose.Schema(SchemaBase({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: Number,
  interval: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  benefits: {
    type: [String],
  },
  stripeId: String,
  freeSurfs: Number
}), { timestamps: true });

export const Subscriptions = mongoose.model<ISubscription>(
  SubscriptionsSchemaName, SubscriptionsSchema
);
