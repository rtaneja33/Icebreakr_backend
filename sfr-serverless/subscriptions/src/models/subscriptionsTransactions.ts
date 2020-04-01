import * as mongoose from "mongoose";
import { IModelBase, SchemaBase, IUser } from "../../../common";


export interface ISubscriptionTransaction extends IModelBase {
  transactionDate: Date;
  transactionAmount: string;
  transactionReceipt: Object;
  userId: string;
  paymentType: Object;
  paymentGatewayInput: Object;
  subscriptionName: string;
  stripeId: string;
  subscriptionId: string;
}

export const SubscriptionTransactionsSchemaName = "subscription_transactions";

const SubscriptionTransactionsSchema = new mongoose.Schema(SchemaBase({
  transactionDate: Date,
  transactionAmount: String,
  transactionReceipt: Object,
  userId: mongoose.SchemaTypes.ObjectId,
  paymentType: Object,
  paymentGatewayInput: Object,
  subscriptionName: String,
  stripeId: String,
  subscriptionId: String
}), { timestamps: true });

export const SubscriptionTransactionss = mongoose.model<ISubscriptionTransaction>(
  SubscriptionTransactionsSchemaName, SubscriptionTransactionsSchema
);
