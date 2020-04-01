// tslint:disable max-file-line-count
import { Response, Router } from "express";
import * as AWS from 'aws-sdk';
import {
  responseError,
  IRequest,
  ErrorKey,
  validateBody,
  StatusCode
} from "../../../common";
import * as mongoose from "mongoose";
import { IBin, TrashBin } from "../models";
import { BinLocation } from "../models";
import { BinReport } from "../models";
import { LocationType } from "../../../location/src/models";
import { Info } from "../models/info";
// const moment = require('moment');
const fileType = require('file-type');


import { UpdateBinSchema, NewBinSchema } from "../schemas";
import { Device } from "../models/device";
import { DeviceReward } from "../models/deviceRewards";
import { parseTrashBinsForLocation, parseTrashBin, parseReportedBins, parseReportedBin } from "../business";
import { serializerTrashBin, serializerReportedTrashBin } from "../serializers";

export function binRouter(route: Router) {

  route.route("/me/reportTrashBin")
    .post(validateBody(UpdateBinSchema, {
        allowUnknown: true
      }),
      reportTrashBin
    );
  
    route.route("/me/createTrashBin")
    .post(validateBody(NewBinSchema, {
        allowUnknown: true
      }),
      createTrashBin
    );
    route.get("/me/nearbyBins", nearbyBins);
    route.get("/getInfo", getInfo);
    route.post("/postInfo",postInfo);
    route.post("/image/uploadFile", uploadFile);
    route.get("/me/getMyReportedBins/:deviceId", getMyReportedBins);
    route.get("/me/getBinDetails/:binId", getBinDetails);
    route.get("/me/getFilteredBins", getFilteredBins);
}

async function getBinDetails(req: IRequest, res: Response) {
  try {
    const binId = req.params.binId;
    let bin = await TrashBin.findById(binId);
    
    if(bin == null) {
      return responseError(req, res, ErrorKey.BinNotFound, {
        statusCode: 404
      });
    }
    bin = await parseTrashBin(bin);
    // const reportedBins = await BinReport.find({bindId: mongoose.Types.ObjectId(binId)});
    // let binReportedImages = [];
    // if(reportedBins != null && reportedBins.length > 0) {
    //   let images = reportedBins.filter((f) => f.imageUrl.toString());
    //   let imagesSet = new Set(images);
    //   binReportedImages.push(...imagesSet);
    // }
    // bin = bin.toJSON ? bin.toJSON() : bin
    return res.json({
      data: serializerTrashBin(bin)
    });
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getMyReportedBins(req: IRequest, res: Response) {
  try {

    const deviceId = req.params.deviceId;
    if(deviceId == null) {
      return responseError(req, res, ErrorKey.DeviceIdNeeded);
    }
    const device = await Device.findOne({
      deviceId: deviceId
    });
    if(device == null) {
      return responseError(req, res, ErrorKey.DeviceNotFound, {
        statusCode: 404
      });
    }
    console.log("Current device: ", device._id);
    let binsReported = await BinReport.find({
      reportedByDevice: device._id
    }).sort({createdAt: -1});
    console.log("binreported: ", binsReported);
    let binsCount = 0;
    if(binsReported != null && binsReported.length > 0) {
      const binIds = binsReported.map((e) => e.binId);
      const rewardsEarned = await DeviceReward.find({
        binId: { $in: binIds}
      });
      binsReported = await parseReportedBins(binsReported, rewardsEarned);
      const countBins = binsReported.map((e) => e.binId.toString());
      console.log("countBins: ", countBins);
      const binsSet = new Set(countBins);
      console.log("binSet: ", ...binsSet);
      binsCount = binsSet.size;
      console.log("binsCount: ", binsCount);
    }
    return res.json({
      count: binsCount,
      data: binsReported.map(serializerReportedTrashBin)
    });
  } catch(error) {
    return responseError(req, res, error);
  }
}

async function uploadFile(req, res:Response) {
  try {
    
    AWS.config.setPromisesDependency(require('bluebird'));
    AWS.config.update({
      accessKeyId: 'AKIATBWDPGBA4PHW7AUB',
      secretAccessKey: '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',
      region: 'ap-southeast-1'
    });
    const s3 = new AWS.S3();
    
    let base64String = req.body.base64String;

    // pass the base64 string into a buffer
    let buffer = new Buffer(base64String, 'base64');

    let fileMime = fileType(buffer);

    // check if the base64 encoded string is a file
    if (fileMime === null) {
        console.log('The string supplied is not a file type');
    }

    let file = getFile(fileMime, buffer);
    let params = file.params;
    console.log("params: ", params);
    
    let location = '';
    let key = '';
    const { Location, Key } = await s3.upload(params).promise();
    location = Location;
    key = Key;
    console.log(location, key);
    return res.json({
      filePath: location
    });
  } catch(error) {
    return responseError(req, res, error);
  }
}

function getFile(fileMime, buffer) {
   // get the file extension
   let fileExt = fileMime.ext;
  //  let now = moment().format('YYYY-MM-DD HH:mm:ss');

   let fileName = Date.now() + '.' + fileExt;
   let params = {
       Bucket: "mtrashbins",
       Key: "images/" + fileName,
       // 'this is simply the filename and the extension, e.g fileFullName + fileExt',
       Body: buffer,
       ContentType: fileMime.mime,
       ContentEncoding: 'base64',
   };
   

   let uploadFile = {
       size: buffer.toString('ascii').length,
       type: fileMime.mime,
       name: fileName
      //  full_path: fileFullPath
   }

   return {
       'params': params,
       'uploadFile': uploadFile
   }
  
  
}

async function postInfo(req: IRequest, res: Response) {
  console.log("Add Info");
  try {
    const info = req.body.info;
    //const currentUserId = req.context.currentUser._id;
    //console.log("Current User Id is: ", req.context.currentUser._id);
    //let message = "Issue";

    const IssueForm = {
      info: info
    //  createdBy: currentUserId
    };
    const information =await Info.create(IssueForm);

    return res.json({
      data: information});
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function getInfo(req: IRequest, res: Response) {
try {
  const info = await Info.find({});
  return res.json(info)
} catch(error) {
  return responseError(req, res, error);
}
}
async function nearbyBins(req: IRequest, res: Response) {
    try {
        
      let bins = await TrashBin.aggregate([{
      $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(req.query.lat),parseFloat(req.query.lng) ] },
          distanceField: "calcDistance"
        //  minDistance: 2,
        //  query: { category: "Parks" },
        //  includeLocs: "dist.location",
        //  spherical: true
        }
      }]);
      bins = await parseTrashBinsForLocation(bins);

      return res.json({
        data: bins.map(serializerTrashBin)
      });
    } catch(error) {
      return responseError(req, res, error);
    }
  }

async function getFilteredBins(req: IRequest, res: Response) {
  try {
    if(req.query == null || req.query.lat == null || req.query.lng == null) {
      return responseError(req, res, ErrorKey.LatLongNeeded);
    }
    
    var locationField = {
      $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(req.query.lat),parseFloat(req.query.lng) ] },
          distanceField: "calcDistance"
      }
    };
    let modelFilter : any = {
      status: StatusCode.Active,
    }
    if(req.query != null) {
      const query = req.query;
      if(query.hasOwnProperty('binType')) {
        modelFilter.binType = query.binType;
      }
      if(query.hasOwnProperty('binCondition')) {
        modelFilter.binCondition = query.binCondition;
      }
    }
    let filteredBins = await TrashBin.aggregate([
      locationField,
      { $match: modelFilter },
      { $sort: { calcDistance: -1 } }
    ]);
    filteredBins = await parseTrashBinsForLocation(filteredBins);
    
    return res.json({
      data: filteredBins.map(serializerTrashBin)
      
    });
  } catch(error) {
    return responseError(req, res, error);
  }
} 

async function reportTrashBin(req: IRequest, res: Response) {
    try {
      const postBin : IBin = req.body;
      
      console.log("postBin:" , postBin);
      const deviceid = postBin.deviceId;
      if(deviceid == null) {
        return responseError(req, res, ErrorKey.DeviceIdNeeded);
      }
      if(postBin.binId == null) {
        return responseError(req, res, ErrorKey.BinIdNeeded);
      }
      let updatedBin = await TrashBin.findById(postBin.binId);
      if(updatedBin == null) {
        return responseError(req, res, ErrorKey.BinNotFound, {
          statusCode: 404
        });
      }
        const location = {
            type: LocationType.POINT,
            coordinates: [req.body.longitude, req.body.latitude]
        } 
        console.log("location:" , location);

        let device = await Device.findOne({deviceId: deviceid});
        if(device == null) {
          device = await Device.create({
          deviceId: deviceid,
          location: location,
          rewardsEarned: 0
          });
        }

      postBin.location = location;
      postBin.reportedByDevice = device._id;
      
        
      console.log("form: ", postBin);

      const formBinLocation = {
        referenceId: device._id,
        location: location
      }

      let locationUpdated = await BinLocation.create(formBinLocation);
      let reportUpdated = await BinReport.create(postBin);

      console.log("Updated location: ", locationUpdated);
      console.log("bin reported: ", reportUpdated);

      updatedBin = await TrashBin.findByIdAndUpdate(mongoose.Types.ObjectId(postBin.binId), postBin, {new: true});
      console.log("result:" , updatedBin);
      const confRewardPoints = parseInt(process.env.REWARD_POINTS);
      
      const rewardForm = {
        rewardedDevice: device._id,
        rewardPoints: confRewardPoints,
        binId: postBin.binId
      }
      const deviceReward = await DeviceReward.create(rewardForm);
      let deviceRewardPoints = 0;
      if(device.rewardsEarned != null) {
        deviceRewardPoints = device.rewardsEarned;
      }
      deviceRewardPoints = deviceRewardPoints + confRewardPoints;
      await Device.findByIdAndUpdate(device._id, {
        rewardsEarned: deviceRewardPoints
      }, {new: true});

      let reportedBin = await parseReportedBin(reportUpdated, deviceReward);
      
      return res.json({
        message: "Reported successfully!!!",
        data: serializerReportedTrashBin(reportedBin)
      });

    } catch (error) {
        return responseError(req, res, error);
    }
}

async function createTrashBin(req:IRequest, res: Response) {
    try {
      const body = req.body;
      const location = {
          type: LocationType.POINT,
          coordinates: [req.body.longitude, req.body.latitude]
      } 
      const deviceid = body.deviceId;
      if(deviceid == null) {
        return responseError(req, res, ErrorKey.DeviceIdNeeded);
      }
      let device = await Device.findOne({deviceId: deviceid});
      if(device == null) {
        device = await Device.create({
        deviceId: deviceid,
        location: location
        });
      }
      
      body.createdByDevice = device._id;
      body.location = location;
      console.log("Form is: ", body);
      let trash = await TrashBin.create(body);
      trash = await parseTrashBin(trash);
      return res.json({
          data: serializerTrashBin(trash)
      });
    } catch(error) {
        return responseError(req, res, error);
    }
}