import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "../../../common";

export enum BinType {
  Trash = "Trash",
  Recycle = "Recycle",
  Ashtray = "Ashtray"
}

export enum BinCondition {
  Normal = "Normal",
  Full = "Full",
  Dirty = "Dirty",
  Damaged = "Damaged"
}


export interface IBin extends IModelBase{
    binId?: string;
    remarks?: string;
    location: Object;
    altitude: number;
    imageUrl: string;
    floor: number;
    deviceId?: string;
    binType: BinType;
    binCondition: BinCondition;
    reportedByDevice: string;
    createdByDevice: string;
    calcDistance: number;
    rewardsEarned: number;
    distance: number;
  }
  
export const TrashBinSchemaName = "trashbins";


const TrashBinSchema = new mongoose.Schema(SchemaBase({
  
  location: {
    required: true,
    type: Object
  }, 
  remarks: String,
  altitude: Number,
  imageUrl: String,
  floor: Number,
  binType: String,
  binCondition: String,
  reportedByDevice: mongoose.SchemaTypes.ObjectId,
  createdByDevice: mongoose.SchemaTypes.ObjectId
}), {
  timestamps: true
});


export const TrashBin = mongoose.model<IBin>(TrashBinSchemaName, TrashBinSchema);
