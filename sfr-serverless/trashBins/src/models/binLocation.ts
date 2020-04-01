import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "../../../common";
import { IDevice, DeviceSchemaName } from "./device";
import { ILocation } from "../../../location/src/models";

export interface IBinLocation extends IModelBase{
    location: ILocation,
    referenceId: string,
    reference?: IDevice
}

export const BinLocationSchemaName = "binlocations";

const LocationSchema = new mongoose.Schema(SchemaBase({
  referenceId: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId,
    ref: DeviceSchemaName
  },
  location: Object
}), {
  timestamps: true
});

//LocationSchema.index({ referenceId: 1, createdBy: 1, type: 1 }, { unique: true });

export const BinLocation = mongoose.model<IBinLocation>(BinLocationSchemaName, LocationSchema);
