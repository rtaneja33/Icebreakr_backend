import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "./common";
import { IUser, UserSchemaName } from "./user";

export interface IUserRewards extends IModelBase {
  rewardedUser: string;
  rewardPoints: Number;
  binId: string;
}

export const UserRewardsSchemaName = "user_rewards";

const UserRewardsSchema = new mongoose.Schema(SchemaBase({
  rewardedUser: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId,
    ref: UserSchemaName
  },
  rewardPoints: Number,
  binId: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId
  }
}), { timestamps: true });

export const UserRewards = mongoose.model<IUserRewards>(
  UserRewardsSchemaName, UserRewardsSchema
);
