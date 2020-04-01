import * as mongoose from "mongoose";
import { SchemaBase, IModelBase } from "./common";
import { UserSchemaName, IUser } from "./user";

export interface IUserLocation extends IModelBase{
    location: ILocation,
    referenceId: string,
    reference?: IUser
}

export interface ILocation {
  type: {
    type: string,
    enum: [LocationType.POINT]
  },
  coordinates: [number, number]
}

export const LocationSchemaName = "locations";

export enum LocationType {
    POINT = "Point"
}

const LocationSchema = new mongoose.Schema(SchemaBase({
  referenceId: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId,
    ref: UserSchemaName
  },
  location: Object
}), {
  timestamps: true
});

//LocationSchema.index({ referenceId: 1, createdBy: 1, type: 1 }, { unique: true });

export const UserLocation = mongoose.model<IUserLocation>(LocationSchemaName, LocationSchema);
