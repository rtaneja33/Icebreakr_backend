import { IBin, BinType, BinCondition, IBinReport } from "../models";

export interface ITrashBinResponse {
  _id: string;
  binId: string;
  remarks: string;
  location: Object;
  altitude: number;
  imageUrl: string;
  floor: number;
  binType: BinType;
  binCondition: BinCondition;
  calcDistance: number;
  distance: number;
  rewardsEarned: number;
}

export interface IReportedTrashBinResponse {
  _id: string;
  binId: string;
  remarks: string;
  location: Object;
  altitude: Number;
  imageUrl: string;
  floor: number;
  binType: BinType;
  binCondition: BinCondition;
  rewardsEarned: number;
}

export function serializerReportedTrashBin(model: IBinReport): IReportedTrashBinResponse {
  if(model == null) {
    return null;
  }
  return {
    _id: model._id,
    binId: model.binId,
    remarks: model.remarks,
    location: model.location,
    altitude: model.altitude,
    imageUrl: model.imageUrl,
    floor: model.floor,
    binType: model.binType,
    binCondition: model.binCondition,
    rewardsEarned: model.rewardsEarned
  };
}

export function serializerTrashBin(model: IBin): ITrashBinResponse {
  if(model == null) {
    return null;
  }
  return {
    _id: model._id,
    binId: model.binId,
    remarks: model.remarks,
    location: model.location,
    altitude: model.altitude,
    imageUrl: model.imageUrl,
    floor: model.floor,
    binType: model.binType,
    binCondition: model.binCondition,
    calcDistance: model.calcDistance,
    distance: model.distance,
    rewardsEarned: model.rewardsEarned
  };
}


