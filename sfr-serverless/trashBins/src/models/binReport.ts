import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "../../../common";
import { ILocation } from "../../../location/src/models";
import { BinType, BinCondition } from "./trashBin";

export interface IBinReport extends IModelBase{
    binId?: string;
    remarks?: string;
    location:ILocation;
    imageUrl: string;
    altitude: number;
    floor: number;
    reportedByDevice: string;
    rewardsEarned: number;
    binType: BinType;
    binCondition: BinCondition;
  }

export interface ILocation {
    coordinates: [Number, Number]
  }
  
export const BinReportSchemaName = "bins_reported";


const BinReportSchema = new mongoose.Schema(SchemaBase({
  
  location: {
    required: true,
    type: Object
  }, 
  remarks: String,
  binId: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId
  },
  imageUrl: String,
  altitude: Number,
  floor: Number,
  binType: String,
  binCondition: String,
  reportedByDevice: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true
  }
}), {
  timestamps: true
});


export const BinReport = mongoose.model<IBinReport>(BinReportSchemaName, BinReportSchema);
