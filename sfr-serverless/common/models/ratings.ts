import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "./common";
import { IUser, UserSchemaName } from './user'

export interface IUserRating extends IModelBase{
    ratings: Number,
    referenceId: string,
    reference?: IUser,
    review: string
}

export const RatingSchemaName = "ratings";

const RatingSchema = new mongoose.Schema(SchemaBase({
  referenceId: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId,
    ref: UserSchemaName
  },
  ratings: {
    required: true,
    type: Number
  },
  review: String
}), {
  timestamps: true
});


export const Rating = mongoose.model<IUserRating>(RatingSchemaName, RatingSchema);
