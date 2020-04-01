import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "../../../common";
import { ILocation } from "../../../location/src/models";

export interface IDevice extends IModelBase{
   deviceId: string;
   location: ILocation;
   rewardsEarned: number;
  }

export const DeviceSchemaName = "devices";


const DeviceSchema = new mongoose.Schema(SchemaBase({
  deviceId: {
    type: String,
    required: true
  },
  location: Object,
  rewardsEarned: Number
}), {
  timestamps: true
});

DeviceSchema.index({deviceId: 1}, { unique: true});

export const Device = mongoose.model<IDevice>(DeviceSchemaName, DeviceSchema);
