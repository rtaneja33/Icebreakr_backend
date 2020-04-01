import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "../../../common";
import { ILocation } from "../../../location/src/models";

export interface IDeviceRewards extends IModelBase{
   rewardedDevice: string;
   rewardPoints: number;
   binId: string;
  }

export const DeviceRewardsSchemaName = "device_rewards";


const DeviceRewardsSchema = new mongoose.Schema(SchemaBase({
  rewardedDevice: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true
  },
  rewardPoints: Number,
  binId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true
  }
}), {
  timestamps: true
});


export const DeviceReward = mongoose.model<IDeviceRewards>(DeviceRewardsSchemaName, DeviceRewardsSchema);
