// tslint:disable max-file-line-count
import { Response, Router } from "express";
import * as mongoose from "mongoose";
import * as AWS from 'aws-sdk';
import {
  responseError,
  validateHeader,
  verifyFirebaseToken, ErrorKey, HeaderAuthorizationSchema,
  IRequest, StatusCode, User, filterPagination, FriendRequestStatus, 
  getContentNotification, NotificationKeyType, NotificationUser, NotificationSchemaName, 
  createAndPushNotificationWithFormat, ReferenceType, IAccountActivity, AccountActivity, LocationType, UserLocation
} from "../../../common";
import { parseProfiles, parseUserProfile, hasSentMeFriendRequests, 
  getMyFriendUserIdList, getFriendIdStringList, mySentFriendRequests, emptyJson, parseMyNotification} from "../business";
import { IUserFormCreate, UserChat } from "../models";
import { serializerUser, serializerNotificationItem } from "../serializers";
import { UserFriend } from "../models/user-friends";
const fileType = require('file-type');

export function userRouter(route: Router) {

  route.route("/me")
    .get(
      validateHeader(HeaderAuthorizationSchema, {
        allowUnknown: true
      }),
      getProfile
    )
    .put(
      // validateHeader(HeaderAuthorizationSchema, {
      //   allowUnknown: true
      // }),
      // validateBody(UpdateUserSchema, {
      //   allowUnknown: true
      // }),
      updateProfile
    );
  
  route.get("/me/getMyData", getMyData);
  route.get("/users/getUserProfile/:userId", getUserProfile);
  route.post("/me/sendFriendRequest/:userId", sendFriendRequest);
  route.post("/me/respondToFriendRequest", respondToFriendRequest);
  route.post("/me/getFriends", getFriends);
  route.post("/me/removeFromFriends/:userId", removeFromFriends);
  route.post("/me/getNearbyUsers", getNearbyUsers);
  route.post("/me/getSuggestionContacts", getSuggestionContacts);
  route.get("/me/notifications", getMyNotification);
  route.post("/me/readMyNotification/:id", readMyNotification);
  route.post("/me/markAllNotificationsRead", markAllNotificationsRead);
  route.post("/me/logUserActivity", logUserActivity);
  route.post("/me/updateLocation", updateLocation);
  route.post("/me/sendMessage", sendMessage);
  route.get("/me/getMySentMessages", getMySentMessages);
  route.get("/me/getMessagesSentToMe", getMessagesSentToMe);
  route.get("/me/getAllMyMessages", getAllMyMessages);
  route.get("/me/getAllUsers", getAllUsers);
  route.post("/me/uploadProfileImage", uploadProfileImage);

}

async function uploadProfileImage(req, res:Response) {
  try {
    AWS.config.setPromisesDependency(require('bluebird'));
    AWS.config.update({
      accessKeyId: 'AKIAJ7A7JWEQSXKY4ETQ',
      secretAccessKey: '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',
      region: 'us-east-1'
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
       Bucket: "icebreaker-dev-images",
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

async function getAllUsers(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    let currentUser = await User.findById(currentUserId);
    const modelFilter = {
      status: StatusCode.Active,
      _id : {
        $nin: [currentUser._id]
      }
    }
    
    var METERS_PER_MILE = Number(process.env.METERS_PER_MILE);
    var defaultDistance = Number(process.env.DEFAULT_DISTANCE);
    if(currentUser.searchRadius != null) {
      defaultDistance = currentUser.searchRadius;
    }
    var locationField = {
      $geoNear: {
          near: { type: "Point", coordinates: currentUser.location.coordinates },
          distanceField: "calcDistance",
          distanceMultiplier: 0.000621371,
          maxDistance: defaultDistance * METERS_PER_MILE
      }
    };
    const models = await filterPagination(User, modelFilter, {
      ...req.query,
      sort: { calcDistance: 1 },
      needParse: false,
      buildQuery: (query, limit, skip) => {
        
      let queryBase;
  
      queryBase = query.aggregate([
        locationField,
        { $match: modelFilter },
        { $sort: { calcDistance: 1 } }
      ]);
      
      console.log("query base is: ", queryBase);
      return queryBase.skip(skip).limit(limit);
      
      }
    });
    if(models.data != null && models.data.length > 0){
      const friendIdList = await getFriendIdStringList(currentUserId);
      const mySentRequests = await mySentFriendRequests(currentUserId);
      const receivedRequests = await hasSentMeFriendRequests(currentUserId);
      models.data = await parseProfiles(models.data);
      // models.data = await parseBlock(currentUserId, models.data);
      for(var k = 0; k< models.data.length; k++) {
        var data = models.data[k];
        data.isMyFriend = friendIdList.length > 0 && friendIdList.includes(data._id.toString());
        data.friendRequestSent = mySentRequests.length > 0 && mySentRequests.includes(data._id.toString());
        data.friendRequestReceived = receivedRequests.length > 0 && receivedRequests.includes(data._id.toString());
      }
    }
    return res.json({
      data: models.data.map(serializerUser),
      pagination: models.pagination
    });

  } catch(error) {
    return responseError(req, res, error);
  }
}

async function sendMessage(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    const chatForm = req.body;
    chatForm.createdBy = currentUserId;
    const chat = await UserChat.create(chatForm);
    return res.json({
      message: "Message sent successfully!!!!",
      data: chat
    });

  } catch(error) {
    return responseError(req, res, error);
  }
}

async function getMySentMessages(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    const modelFilter = {
      createdBy: mongoose.Types.ObjectId(currentUserId)
    }
    const models = await filterPagination(UserChat, modelFilter, {
      ...req.query,
      sort: { createdAt: -1 },
      needParse: false,
      buildQuery: (query, limit, skip) => {
      
      console.log("Model Filter: ", modelFilter);
      var queryBase = query.aggregate([
        { $match: modelFilter },
        { $sort: { createdAt: -1 } }
      ]);
      
      console.log("query base is: ", queryBase);
      return queryBase.skip(skip).limit(limit);
      }
    });
    return res.json({
      data: models.data,
      pagination: models.pagination
    });

  } catch(error) {
    return responseError(req, res, error);
  }
}

async function getMessagesSentToMe(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    const modelFilter = {
      toUserId: mongoose.Types.ObjectId(currentUserId)
    }
    const models = await filterPagination(UserChat, modelFilter, {
      ...req.query,
      sort: { createdAt: -1 },
      needParse: false,
      buildQuery: (query, limit, skip) => {
      
      console.log("Model Filter: ", modelFilter);
      var queryBase = query.aggregate([
        { $match: modelFilter },
        { $sort: { createdAt: -1 } }
      ]);
      
      console.log("query base is: ", queryBase);
      return queryBase.skip(skip).limit(limit);
      }
    });
    return res.json({
      data: models.data,
      pagination: models.pagination
    });

  } catch(error) {
    return responseError(req, res, error);
  }
}

async function getAllMyMessages(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    const modelFilter = {
      $or: [
        { toUserId: mongoose.Types.ObjectId(currentUserId) },
        { createdBy: mongoose.Types.ObjectId(currentUserId) }
      ]
    }
    const models = await filterPagination(UserChat, modelFilter, {
      ...req.query,
      sort: { createdAt: -1 },
      needParse: false,
      buildQuery: (query, limit, skip) => {
      
      console.log("Model Filter: ", modelFilter);
      var queryBase = query.aggregate([
        { $match: modelFilter },
        { $sort: { createdAt: -1 } }
      ]);
      
      console.log("query base is: ", queryBase);
      return queryBase.skip(skip).limit(limit);
      }
    });
    return res.json({
      data: models.data,
      pagination: models.pagination
    });

  } catch(error) {
    return responseError(req, res, error);
  }
}

async function updateLocation(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    const coordinates = req.body.coordinates;
    let newLocation = {
      type: LocationType.POINT,
      coordinates: coordinates
    }
    const locationForm = {
      referenceId: currentUserId,
      location: newLocation
    }
    const createdLocation = await UserLocation.create(locationForm);
    console.log("Created location: ", createdLocation);
    let user = await User.findByIdAndUpdate(currentUserId, {location: newLocation}, {new: true});
    let parsedUser = await parseUserProfile(user)
    return res.json({
      message: "Location updated successfully!!!",
      data: serializerUser(parsedUser)
    })
  } catch(error) {
    return responseError(req, res, error);
  }
}

async function logUserActivity(req:IRequest, res:Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    const accountForm: IAccountActivity = req.body;
    accountForm.affectedUser = currentUserId;
    accountForm.createdBy = currentUserId;
    console.log("Account activity form: ", accountForm);
    const activity = await AccountActivity.create(accountForm);
    return res.json({
      message: "Activity logged successfully!!!!",
      activity: activity
    });
  } catch(error) {
    return responseError(req, res, error);
  }
}

async function readMyNotification(req: IRequest, res: Response) {
  try {
    const notificationId = req.params.id;
    const currentUserId = req.context.currentUser._id;
    let notification = await NotificationUser.findOne({notificationId: notificationId, userId: currentUserId});
    if(notification != null) {
      notification = await NotificationUser.findByIdAndUpdate(notification._id, 
        { isRead: true, updatedBy: currentUserId }, {new: true});
      console.log("notification updated: ", notification);
      return res.json({
        message: "Notifications read successfully!!",
        notification: notification
      });
    }
    return res.json(emptyJson());
  } catch(error) {
    return responseError(req, res, error);
  }
}

async function getMyNotification(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    const createdAt = (await User.findById(currentUserId)).createdAt;
    const modelFilter = {
      isRead: false,
      $or: [
        { userId: mongoose.Types.ObjectId(currentUserId) },
        { typeRole: { $all: [req.context.currentUser.role] } },
      ],
      createdAt: { $gte: createdAt }
    };
    console.log("Model Filter: ", modelFilter);
    const models = await filterPagination(NotificationUser, modelFilter, {
      ...req.query,
      sort: { createdAt: -1 },
      buildQuery: (query, limit, skip) => {
        const lookupNotification = {
          $lookup: {
            from: NotificationSchemaName,
            localField: "notificationId",
            foreignField: "_id",
            as: "notification"
          }
        };

        return query.aggregate([
          { $match: modelFilter },
          lookupNotification,
          { $sort: { createdAt: -1 } }
        ].filter(e => e)).skip(skip).limit(limit);
      }
    });
    console.log("Notific data: ", models.data);
    if(models.data != null && models.data.length > 0) {
      const notifcIds = models.data.map((e) => e._id);
      console.log("notifcIds: ", notifcIds);
      const viewedNotifications = await NotificationUser.updateMany(
        { _id: { $in: notifcIds } }, 
        { $set: { isViewed: true } }
      );
      console.log("Viewed Notifications: ", viewedNotifications);
    }
    
    return res.json({
      data: (await parseMyNotification(models.data.map((e) => e.notificationId), {
        actorId: req.context.currentUser._id
      })).map(serializerNotificationItem),
      pagination: models.pagination
    });
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function markAllNotificationsRead(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    let notifications = await NotificationUser.find({userId: currentUserId});
    if(notifications != null) {
      const notificationIds = notifications.map((e) => e._id);
      console.log("Notification Ids: ", notificationIds);
      let readNotifications = await NotificationUser.updateMany(
        { _id: { $in: notificationIds } }, 
        { $set: { isRead: true } }
      );
      console.log("notifications: ", readNotifications);
      return res.json({
        // data: (await parseMyNotification(notifications.map((e) => e.notificationId), {
        //   actorId: req.context.currentUser._id
        // })).map(serializerNotificationItem)
        message: "All notifications read successfully!!"
        // data: notifications
      });
    }
    return res.json(emptyJson());
  } catch(error) {
    return responseError(req, res, error);
  }
}

async function getNearbyUsers(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    let currentUser = await User.findById(currentUserId);

    let isCoordinatesSame = false;
    console.log("req coordinates: ", req.body.coordinates);
    console.log(req.body != null && req.body.coordinates != null);
    let locationField;
    
    var METERS_PER_MILE = Number(process.env.METERS_PER_MILE);
    var defaultDistance = Number(process.env.DEFAULT_DISTANCE);
    if(currentUser.searchRadius != null) {
      defaultDistance = currentUser.searchRadius;
    }
    console.log("defaultDistance: ", defaultDistance);
    console.log("METERS_PER_MILE: ", METERS_PER_MILE);
    if(req.body != null && req.body.coordinates != null){
      let locCoordinates = req.body.coordinates;
      if(currentUser.location != null
        && currentUser.location.coordinates != null && currentUser.location.coordinates.length > 0) {
       const userCoordinates = currentUser.location.coordinates;
       if(locCoordinates[0] === userCoordinates[0] && locCoordinates[1] === userCoordinates[1]) {
         isCoordinatesSame = true;
       }
       
       console.log("userCoordinates: ", userCoordinates);
     }
     console.log("locCoordinates: ", locCoordinates);
     console.log("isCoordinatesSame: ", isCoordinatesSame);
     if(!isCoordinatesSame) {
        const newLocation = {
          type: LocationType.POINT,
          coordinates: locCoordinates
        };
        const userLocationForm = {
          referenceId: currentUserId,
          location: newLocation,
          createdBy: currentUserId
        }
        console.log("Form is: ", userLocationForm);
        let locationUpdated = await UserLocation.create(userLocationForm);
        console.log("Updated location: ", locationUpdated);
        currentUser = await User.findByIdAndUpdate(currentUserId, {location: newLocation}, {new: true});
      }

      locationField = {
        $geoNear: {
            near: { type: "Point", coordinates: currentUser.location.coordinates },
            distanceField: "calcDistance",
            distanceMultiplier: 0.000621371,
            maxDistance: defaultDistance * METERS_PER_MILE
        }
      };
    }

    
    console.log("location field: ", locationField);
    var modelFilter: any = {
      status: StatusCode.Active,
      _id : {
        $nin: [currentUser._id]
      }
    };
    const query = req.query;
    console.log("request Query: ", query);
    if(query != null && query.hasOwnProperty('name') && query.name != ''.trim()) {
      const searchString = query.name.toString().toLowerCase();
      console.log("Search: ", query.name);
      console.log('String: ', searchString);
      
      modelFilter = {
        $and: [
          { status: StatusCode.Active },
          { _id : {
              $nin: [currentUser._id]
            }
          },
          {
            $or: [
              { displayName: new RegExp(searchString, "i")},
              { companyName: new RegExp(searchString, "i")}
            ]
          }
        ]
      }
    } else if(query != null && query.hasOwnProperty('searchParams') && query.searchParams === 'location') {
      console.log("search coordinates: ", req.body.searchCoordinates.length);
      if(req.body.searchCoordinates != null && req.body.searchCoordinates.length == 2) {
        locationField = {
          $geoNear: {
              near: { type: "Point", coordinates: req.body.searchCoordinates },
              distanceField: "calcDistance",
              distanceMultiplier: 0.000621371,
              maxDistance: defaultDistance * METERS_PER_MILE
          }
        };
      } else {
        return responseError(req, res, ErrorKey.SearchCoordinatesNeeded);
      }

    }


    console.log("Model Filter: ", modelFilter);


    const models = await filterPagination(User, modelFilter, {
      ...req.query,
      sort: { calcDistance: 1 },
      needParse: false,
      buildQuery: (query, limit, skip) => {
        
      let queryBase;
  
      queryBase = query.aggregate([
        locationField,
        { $match: modelFilter },
        { $sort: { calcDistance: 1 } }
      ]);
      
      console.log("query base is: ", queryBase);
      return queryBase.skip(skip).limit(limit);
      
      }
    });
    if(models.data != null && models.data.length > 0){
      const friendIdList = await getFriendIdStringList(currentUserId);
      const mySentRequests = await mySentFriendRequests(currentUserId);
      const receivedRequests = await hasSentMeFriendRequests(currentUserId);
      models.data = await parseProfiles(models.data);
      // models.data = await parseBlock(currentUserId, models.data);
      for(var k = 0; k< models.data.length; k++) {
        var data = models.data[k];
        data.isMyFriend = friendIdList.length > 0 && friendIdList.includes(data._id.toString());
        data.friendRequestSent = mySentRequests.length > 0 && mySentRequests.includes(data._id.toString());
        data.friendRequestReceived = receivedRequests.length > 0 && receivedRequests.includes(data._id.toString());
      }
    }
    return res.json({
      data: models.data.map(serializerUser),
      pagination: models.pagination
    });

  } catch(error) {
    return responseError(req, res, error);
  }
}

async function getMyData(req: IRequest, res: Response) {
  try {
    return res.json({
      data: "This is test data"
    });
  } catch(error) {
    return responseError(req, res, error);
  }
}

export async function getSuggestionContacts(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    const currentUser = await User.findById(currentUserId);
    const myFriends = await getMyFriendUserIdList(currentUserId);
    
    let notTobeIncludedList = [currentUser._id];
    if(myFriends != null && myFriends.length > 0){
      notTobeIncludedList.push(...myFriends);
    }
    console.log("notTobeIncludedList: ", notTobeIncludedList);
    let modelFilter: any = {
      status: StatusCode.Active
    };
    let locationField = null;
    
    var METERS_PER_MILE = Number(process.env.METERS_PER_MILE);
    var defaultDistance = Number(process.env.DEFAULT_DISTANCE);
    if(currentUser.searchRadius != null) {
      defaultDistance = currentUser.searchRadius;
    }
    const query = req.query;
    if(query != null && query.hasOwnProperty('name') && query.name != ''.trim()) {
      const searchString = query.name.toString().toLowerCase();
      console.log("Search: ", query.name);
      console.log('String: ', searchString);
      // modelFilter.displayName = new RegExp(searchString, "i");
      modelFilter = {
        $and: [
          { status: StatusCode.Active },
          {
            $or: [
              { displayName: new RegExp(searchString, "i")},
              { companyName: new RegExp(searchString, "i")}
            ]
          }
        ]
      }
    } else if(query != null && query.hasOwnProperty('searchParams') && query.searchParams === 'location') {
      console.log("search coordinates: ", req.body.searchCoordinates.length);
      if(req.body.searchCoordinates != null && req.body.searchCoordinates.length == 2) {
        locationField = {
          $geoNear: {
              near: { type: "Point", coordinates: req.body.searchCoordinates },
              distanceField: "calcDistance",
              distanceMultiplier: 0.000621371,
              maxDistance: defaultDistance * METERS_PER_MILE
          }
        };
      } else {
        return Promise.reject(ErrorKey.SearchCoordinatesNeeded);
      }

    }

    console.log("Model Filter: ", modelFilter);
    const models = await filterPagination(User, modelFilter, {
      ...req.query,
      sort: { displayName: 1 },
      needParse: false,
      buildQuery: (query, limit, skip) => {
      
      modelFilter._id = {
        $nin: notTobeIncludedList
      }
      console.log("Model Filter: ", modelFilter);
      var queryBase = query.aggregate([
        { $match: modelFilter },
        { $sort: { displayName: 1 } }
      ]);
      if(locationField != null) {
        queryBase = query.aggregate([
          locationField,
          { $match: modelFilter },
          { $sort: { displayName: 1 } }
        ]);
      }

      console.log("query base is: ", queryBase);
      return queryBase.skip(skip).limit(limit);
      }
    });
    console.log("Users: ", models);

    if(models.data != null && models.data.length > 0){
      const friendIdList = await getFriendIdStringList(currentUserId);
      const mySentRequests = await mySentFriendRequests(currentUserId);
      const receivedRequests = await hasSentMeFriendRequests(currentUserId);
      models.data = await parseProfiles(models.data);
      // models.data = await parseBlock(currentUserId, models.data);
      for(var k = 0; k< models.data.length; k++) {
        var data = models.data[k];
        data.isMyFriend = friendIdList.length > 0 && friendIdList.includes(data._id.toString());
        data.friendRequestSent = mySentRequests.length > 0 && mySentRequests.includes(data._id.toString());
        data.friendRequestReceived = receivedRequests.length > 0 && receivedRequests.includes(data._id.toString());
      }
    }
    
    return res.json({
      data: models.data.map(serializerUser),
      pagination: models.pagination
    });

  } catch(error) {
    return responseError(req, res, error);
  }
}


export async function getUserProfile(req: IRequest, res: Response) {
  try {
    const userId =  req.params.userId;
    const user = await User.findById(mongoose.Types.ObjectId(userId));
    if (!user) {
      return responseError(req, res, ErrorKey.ProfileNotFound, {
        statusCode: 404
      });
    }
    const [result] = await parseProfiles([user]);

    return res.json({
      data: serializerUser(result)
    });
  } catch(error) {
    return responseError(req, res, error);
  }
}

export async function getProfile(req: IRequest, res: Response) {
  try {

    const token = req.headers.authorization;
    console.log("Token received: ", token);
    //const token = req.body.authToken;
    const authId = await verifyFirebaseToken(token);
    //const authId = req.body.authToken;
    const user = await User.findOne({
      authId: authId
    });
    if (!user) {
      return responseError(req, res, ErrorKey.ProfileNotFound, {
        statusCode: 404
      });
    }
    const [result] = await parseProfiles([user]);

    return res.json({
      data: serializerUser(result)
    });
  } catch (error) {
    console.log("Error Get Profile", error);

    return responseError(req, res, ErrorKey.Unauthorized, {
      statusCode: 401
    });
  }
}



async function updateProfile(req: IRequest, res: Response) {
  console.log("Update profile");
  try {
    const token = req.headers.authorization;
    console.log("Token received: ", token);
    console.log("request body: ", req.body);
    const form: IUserFormCreate = req.body;
    if(form.permissions) {
      delete form.permissions;
    }

    if(form.coordinates) {
      let newLocation = {
        type: LocationType.POINT,
        coordinates: form.coordinates
      }
      form.location = newLocation;
    }
    //const authId = req.body.authId;
    const authId = await verifyFirebaseToken(token);
    console.log("AUth ID is : ", authId );
    const user = await User.findOne({ authId: authId });
    console.log("Is user: ", user);
    let modelUpdated;
    if (user) {
      modelUpdated = await User.findByIdAndUpdate(user._id,
        form, {
          new: true
        });
    } else {
      console.log("Form is : ", form);
      form.authId = authId;
      
      console.log("Updated form: ", form);
      const [checkPhone, checkAuthIdExisted] = await Promise.all([
        <any>
        User.findOne({
          phone: form.phone,
          status: StatusCode.Active
        }),
        User.findOne({
          authId: authId
        })
        
      ]);

      if (checkPhone) {
        return responseError(req, res, ErrorKey.PhoneExisted);
      }

      if (checkAuthIdExisted) {
        return responseError(req, res, ErrorKey.AuthExisted);
      }
      console.log("Unique user");
      try {
        console.log("Creating user");
        modelUpdated = await User.create(form);
        console.log("user created");
        
      } catch (error) {
        if (error && error.code === 11000 && /phone/g.test(error.errmsg)) {
          return responseError(req, res, ErrorKey.PhoneExisted, {
            statusCode: 404
          });
        }

        return responseError(req, res, error);
      }

    }

    const [result] = await parseProfiles([modelUpdated]);

    return res.json(serializerUser(result));

  } catch (error) {
    return responseError(req, res, error);
  }
}

async function sendFriendRequest(req: IRequest, res: Response) {
  try {
    const friendUserId = req.params.userId;
    const currentUserId = req.context.currentUser._id;
    const friendUser = await User.findById(friendUserId);

    const friendForm = {
      userId: currentUserId,
      friendUserId: friendUser._id,
      requestStatus: FriendRequestStatus.Sent,
      requestSendDate: new Date(),
      createdBy: currentUserId
    }
    await UserFriend.create(friendForm);
    const notify = await createAndPushNotificationWithFormat(null, {
      ...getContentNotification(NotificationKeyType.SentFriendRequest),
      senderId: currentUserId,
      receiverIds: [friendUserId],
      type: ReferenceType.User,
      referenceId: currentUserId
    }, {
      actorId: currentUserId
    });

  const parsedFriend = await parseUserProfile(friendUser);
  parsedFriend.friendRequestSent = true;
  console.log("Sent Notification: ", notify);
  
  return res.json(
    {
      message: "Friend request sent successfully!!!",
      data: serializerUser(parsedFriend)
    });
    
  } catch(error) {
    return responseError(req, res, error);
  }
}

async function respondToFriendRequest(req: IRequest, res: Response) {
  try {
    const friendUserId = req.query.friendUserId;
    const friendResponse = req.query.friendResponse;
    let currentUserId = req.context.currentUser._id;

    var friendRequestStatus = "";
    let currentUser = await User.findById(currentUserId);
    const form = {
      userId: mongoose.Types.ObjectId(friendUserId),
      friendUserId: currentUser._id,
      requestStatus: FriendRequestStatus.Sent
    }
    let parsedFriend;
    const friendRequest = await UserFriend.findOne(form);
    let friendUser = await User.findById(friendUserId);
    parsedFriend = await parseUserProfile(friendUser);
    console.log("Parsed Friend: ", parsedFriend);
    if(friendRequest != null) {

      if(friendResponse === FriendRequestStatus.Accepted) {
        const updatedRequest = await UserFriend.findByIdAndUpdate(friendRequest._id, {
          requestStatus: FriendRequestStatus.Accepted,
          requestApprovedDate: new Date(),
          updatedBy: currentUserId
        }, {new: true});
        console.log("Updated Request: ", updatedRequest);
        friendRequestStatus = FriendRequestStatus.Accepted;

        

        if(friendUser.status === StatusCode.Active) {
          var friendUserFriends = friendUser.numFriends;
          console.log("friendUserFriends: ", friendUserFriends);
          if(null == friendUserFriends || typeof friendUserFriends === 'undefined'){
            friendUserFriends = 0;
          }
          friendUserFriends = friendUserFriends + 1;
          friendUser = await User.findByIdAndUpdate(friendUser._id, {numFriends: friendUserFriends});
          console.log("Updated Friend: ", friendUser);

          var myFriendsCount = currentUser.numFriends;
          console.log("myFriendsCount: ", myFriendsCount);
          if(myFriendsCount == null || typeof myFriendsCount === 'undefined') {
            myFriendsCount = 0;
          }
          myFriendsCount = myFriendsCount + 1;
          parsedFriend.isMyFriend = true;
          currentUser = await User.findByIdAndUpdate(currentUserId, {numFriends: myFriendsCount});
          console.log("My Profile: ", currentUser);
          const notify = await createAndPushNotificationWithFormat(null, {
            ...getContentNotification(NotificationKeyType.AcceptedFriendRequest),
            senderId: currentUserId,
            receiverIds: [friendUser._id],
            type: ReferenceType.User,
            referenceId: currentUserId
          }, {
            actorId: currentUserId
          });
          console.log("Notification sent is: ", notify);
        }
      } else if(friendResponse === FriendRequestStatus.Declined) {
        const updatedRequest = await UserFriend.findByIdAndUpdate(friendRequest._id, {
          requestStatus: FriendRequestStatus.Declined,
          requestApprovedDate: new Date(),
          updatedBy: currentUserId
        }, {new: true});
        console.log("Updated Request: ", updatedRequest);
        friendRequestStatus = FriendRequestStatus.Declined;
        parsedFriend.isMyFriend = false;
      }
      if(req.body.hasOwnProperty('notificationId')) {
        const notificationId = req.body.notificationId;
        let notification = await NotificationUser.findOne({notificationId: notificationId, userId: currentUserId});
        notification = await NotificationUser.findByIdAndUpdate(notification._id, {isRead: true}, {new: true});
        console.log("Notification updated: ", notification);
      }
    } else {
      return responseError(req, res, ErrorKey.InvalidFriendRequest);
    }
    
    return res.json(
      {
        message: "Friend Request " + friendRequestStatus + " Successfully!!!!",
        data: parsedFriend
      });
  } catch (error) {
    return responseError(req, res, error);
  }
}


async function getFriends(req:IRequest, res:Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    const models = await getFriendsData(currentUserId, req);
    console.log("Users: ", models);
     
    if(models.data.length > 0) {
      models.data = await parseProfiles(models.data);
    }
    return res.json({
      data: models.data.map(serializerUser),
      pagination: models.pagination
    });
  } catch(error) {
    return responseError(req, res, error);
  }
}

async function removeFromFriends(req: IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    console.log("Current user Id: ", currentUserId);
    const currentUser = await User.findById(currentUserId);
    const friendUserId = req.params.userId;
    const friendUser = await User.findById(friendUserId);

    const myForm = {
      status: StatusCode.Active,
      userId: friendUserId,
      friendUserId: currentUser._id,
      requestStatus: FriendRequestStatus.Accepted
    }
    const myFriendForm = {
      status: StatusCode.Active,
      userId: currentUser._id,
      friendUserId: friendUser._id,
      requestStatus: FriendRequestStatus.Accepted
    }

    console.log("Myform:", myForm);
    console.log("friendForm: ", myFriendForm);
    const myRequest = await UserFriend.findOne(myForm);
    console.log("My Requests: ", myRequest);
    if(myRequest != null) {
      console.log("my Request: ", myRequest);
      let myUpdatedRequest = await UserFriend.findByIdAndUpdate(myRequest._id, {
        status: StatusCode.Deleted,
        updatedBy: currentUserId,
        updatedAt: new Date()
      }, {new: true});
      console.log("myUpdatedRequest: ", myUpdatedRequest);
    } else {
      const friendRequest = await UserFriend.findOne(myFriendForm);
      console.log("friendRequests: ", friendRequest);
      if(friendRequest != null) {
        let myFriendUpdatedRequest = await UserFriend.findByIdAndUpdate(friendRequest._id, {
          status: StatusCode.Deleted,
          updatedBy: currentUserId,
          updatedAt: new Date()
        }, {new: true});
        console.log("myFriendUpdatedRequest: ", myFriendUpdatedRequest);
      } else {
        return responseError(req, res, ErrorKey.NotAFriend);
      }
    }
    if(friendUser.status === StatusCode.Active) {
      var friendUserFriends = friendUser.numFriends;
      console.log("friendUserFriends: ", friendUserFriends);
      if(null != friendUserFriends && friendUserFriends > 0){
        friendUserFriends = friendUserFriends - 1;
      }
      
      const updatedFriend = await User.findByIdAndUpdate(friendUser._id, {numFriends: friendUserFriends});
      console.log("Updated Friends: ", updatedFriend);

      const currentUser = await User.findById(currentUserId);
      var myFriendsCount = currentUser.numFriends;
      console.log("myFriendsCount: ", myFriendsCount);
      if(myFriendsCount != null && myFriendsCount > 0) {
        myFriendsCount = myFriendsCount - 1;
      }
      
      const myProfile = await User.findByIdAndUpdate(currentUserId, {numFriends: myFriendsCount});
      console.log("My Profile: ", myProfile);
      
    }

    let models = await getFriendsData(currentUserId, req);
    
    if(models.data != null && models.data.length > 0) {
      models.data = await parseProfiles(models.data);
    }
     
    return res.json({
      message: "Removed from my friend list successfully!!!",
      data: models.data.map(serializerUser),
      pagination: models.pagination
    });
    
  } catch(error) {
    return responseError(req, res, error)
  }
}

async function getFriendsData(userId: string, req:IRequest) {
  
  const myFriends = await getMyFriendUserIdList(userId);
  const currentUser = await User.findById(userId);
  let modelFilter: any = {
    status: StatusCode.Active
  };
  let locationField = null;
  var METERS_PER_MILE = Number(process.env.METERS_PER_MILE);
  var defaultDistance = Number(process.env.DEFAULT_DISTANCE);
  if(currentUser.searchRadius != null) {
    defaultDistance = currentUser.searchRadius;
  }
  const query = req.query;
  if(query != null && query.hasOwnProperty('name') && query.name != ''.trim()) {
    const searchString = query.name.toString().toLowerCase();
    console.log("Search: ", query.name);
    console.log('String: ', searchString);
    // modelFilter.displayName = new RegExp(searchString, "i");
    modelFilter = {
      $and: [
        { status: StatusCode.Active },
        {
          $or: [
            { displayName: new RegExp(searchString, "i")},
            { companyName: new RegExp(searchString, "i")}
          ]
        }
      ]
    }
  } else if(query != null && query.hasOwnProperty('searchParams') && query.searchParams === 'location') {
    console.log("search coordinates: ", req.body.searchCoordinates.length);
    if(req.body.searchCoordinates != null && req.body.searchCoordinates.length == 2) {
      locationField = {
        $geoNear: {
            near: { type: "Point", coordinates: req.body.searchCoordinates },
            distanceField: "calcDistance",
            distanceMultiplier: 0.000621371,
            maxDistance: defaultDistance * METERS_PER_MILE
        }
      };
    } else {
      return Promise.reject(ErrorKey.SearchCoordinatesNeeded);
    }

  }

  console.log("Model Filter: ", modelFilter);
  const models = await filterPagination(User, modelFilter, {
    ...req.query,
    sort: { displayName: 1 },
    needParse: false,
    buildQuery: (query, limit, skip) => {
    
    modelFilter._id = {
      $in: myFriends
    }
    console.log("Model Filter: ", modelFilter);
    var queryBase = query.aggregate([
      { $match: modelFilter },
      { $sort: { displayName: 1 } }
    ]);
    if(locationField != null) {
      queryBase = query.aggregate([
        locationField,
        { $match: modelFilter },
        { $sort: { displayName: 1 } }
      ]);
    }

    console.log("query base is: ", queryBase);
    return queryBase.skip(skip).limit(limit);
    }
  });
  return models;
}
