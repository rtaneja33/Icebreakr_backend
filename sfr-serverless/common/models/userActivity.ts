import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "./common";
import { ActivityType } from "./activity";

export enum LikeStatus {
  LIKED = "liked",
  DISLIKED = "disliked"
}

export enum MatchStatus {
  MATCHED = "matched",
  UNMATCHED = "unmatched"
}

export interface IUserActivity extends IModelBase {
  activityType: ActivityType;
  likeStatus: LikeStatus;
  affectedUser: string;
  isSurfBuddy: boolean;
  reason: string[];
  freeCupidCreatedAt: string;
  matchStatus: MatchStatus;
  surfSpent: number;
  nearBy: boolean;
}

export const UserActivitySchemaName = "user_activities";

const UserActivitySchema = new mongoose.Schema(SchemaBase({
  activityType: {
    type: String,
  },
  affectedUser: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  isSurfBuddy: Boolean,
  reason: String,
  likeStatus: String,
  matchStatus: String,
  freeCupidCreatedAt: String,
  surfSpent: Number,
  nearBy: Boolean
}), { timestamps: true });

export const UserActivity = mongoose.model<IUserActivity>(
  UserActivitySchemaName, UserActivitySchema
);
