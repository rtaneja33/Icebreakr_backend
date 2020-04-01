import * as lodash from "lodash";
import * as coupon from "coupon-code";
import * as moment from "moment";

import {
  getFirebaseUserById,
  updateUserFirebaseByAuthId, IUser, Gender,
  User, ActivityType, AccountActivity, UserActivity, LookingForOptions, Education, Ethnicity, SunSign, Options, LookingFor, StatusCode, FriendRequestStatus } from "../../../common";
import { serializerUser } from "../serializers";
import { UserRewards } from "../../../common/models/rewardsTransactions";
import { UserFriend } from "../models";


export function emptyJson(){
  return {
    data: [],
    pagination: {
      total: 0,
      size: 0,
      totalPages: 0,
      page: 1,
      nextPageToken: null
    }
  };
}


export async function getFriendIdStringList(currentUserId: String) {
  try {
    const myFriends = await getMyFriendUserIdList(currentUserId);
    var friendIdList = [];
    if(myFriends != null && myFriends.length > 0) {
      for (var i=0; i< myFriends.length; i++){
        var myFriendId = myFriends[i];
        friendIdList.push(myFriendId.toString());
      }
    }
    return friendIdList;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getMyFriendUserIdList(currentUserId) {
  try {
    let modelFilter = {
      status: StatusCode.Active,
      $or: [{userId: currentUserId}, {friendUserId: currentUserId}],
      requestStatus: FriendRequestStatus.Accepted
    }

    const models = await UserFriend.find(modelFilter);

    var myFriendIds = [];
    if(models != null && models.length > 0) {
      for(var i=0; i<models.length; i++) {
        let data = models[i];
        if(data.userId.toString() === currentUserId.toString()) {
          myFriendIds.push(data.friendUserId);
        } else if(data.friendUserId.toString() === currentUserId.toString()) {
          myFriendIds.push(data.userId);
        }
      }
    }
    
    console.log("My friend Ids: ", myFriendIds);
    
    return myFriendIds;
  } catch(error) {
    return Promise.reject(error);
  }
}

export async function mySentFriendRequests(currentUserId: String) {
  try {
    const mySentRequests = await UserFriend.find({
      status: StatusCode.Active,
      userId: currentUserId,
      createdBy: currentUserId
    });
    var mySentRequestsList = [];
    if(mySentRequests != null && mySentRequests.length > 0) {
      for(var i=0; i< mySentRequests.length; i++) {
        var sentRequest = mySentRequests[i];
        mySentRequestsList.push(sentRequest.friendUserId.toString());
      }
    }
    console.log("mySentRequestsList", mySentRequestsList);
    return mySentRequestsList;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function hasSentMeFriendRequests(currentUserId: String) {
  try {
    const receivedRequests = await UserFriend.find({
      status: StatusCode.Active,
      friendUserId: currentUserId,
      requestStatus: FriendRequestStatus.Sent,
    });
    var receivedRequestsList = [];
    if(receivedRequests != null && receivedRequests.length > 0) {
      for(var i=0; i< receivedRequests.length; i++) {
        var receivedRequest = receivedRequests[i];
        receivedRequestsList.push(receivedRequest.userId.toString());
      }
    }
    console.log("receivedRequests", receivedRequestsList);
    return receivedRequestsList;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function parseProfiles(users: IUser[]) {
  try {
    return users.map((e) => ({
      ...e.toJSON ? e.toJSON() : e
      
    }));

  } catch (error) {
    return Promise.reject(error);
  }
}

export async function parseUserProfile(user: IUser) {
  try {
    return user.toJSON ? user.toJSON() : user;

  } catch (error) {
    return Promise.reject(error);
  }
}

