import { IBin, IBinReport } from "../models";
import { IDeviceRewards } from "../models/deviceRewards";

export async function parseTrashBins(bins: IBin[]) {
  try {
    return bins.map((e) => ({
      ...e.toJSON ? e.toJSON() : e
      
    }));

  } catch (error) {
    return Promise.reject(error);
  }
}

export async function parseReportedBins(binsReported: IBinReport[], rewardsEarned: IDeviceRewards[]){
  try {
    return binsReported.map((e) => ({
      ...e.toJSON ? e.toJSON() : e,
      rewardsEarned: rewardsEarned.filter((f) => f.binId.toString() === e.binId.toString())[0].rewardPoints || 0
    }));
  } catch(error) {
    return Promise.reject(error);
  }
}

export async function parseReportedBin(binReported: IBinReport, rewardsEarned: IDeviceRewards){
  try {
    binReported = binReported.toJSON ? binReported.toJSON() : binReported;
    binReported.rewardsEarned = rewardsEarned != null ? rewardsEarned.rewardPoints : 0;
    return binReported;
  } catch(error) {
    return Promise.reject(error);
  }
}

export async function parseTrashBinsForLocation(bins: IBin[]) {
  try {
    return bins.map((e) => ({
      ...e.toJSON ? e.toJSON() : e,
      distance: e.calcDistance != null ? e.calcDistance.toFixed(1) : null
    }));
  } catch(error) {
    return Promise.reject(error);
  }
}

export async function parseTrashBin(bin: IBin) {
  try {
    return bin.toJSON ? bin.toJSON() : bin;

  } catch (error) {
    return Promise.reject(error);
  }
}

