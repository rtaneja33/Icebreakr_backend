import { IPhone, IUser, AlumnusStatus, Provider, ILocation } from "../../../common";

export interface IUserResponse {
  id: string;
  avatar: string;
  companyName: string;
  jobTitle: string;
  alumnusStatus: AlumnusStatus;
  currentAttendingSchool: string;
  alumnusOfSchool: string;
  cityOfOrigin: string;
  phone: IPhone;
  phoneVerified: boolean;
  displayName: string;
  email: string;
  country: string;
  location: ILocation;
  provider: Provider;
  deviceToken: string;
  deviceType: string;
  calcDistance: number;
  socialInfo: Object;
  numFriends: number;
  isMyFriend: boolean;
  friendRequestSent: boolean;
  friendRequestReceived: boolean;
  role: string;
  searchRadius: number;
}

export function serializerUser(model: IUser): IUserResponse {
  return {
    id: model._id,
    avatar: model.avatar,
    companyName: model.companyName,
    jobTitle: model.jobTitle,
    alumnusStatus: model.alumnusStatus,
    currentAttendingSchool: model.currentAttendingSchool,
    alumnusOfSchool: model.alumnusOfSchool,
    cityOfOrigin: model.cityOfOrigin,
    phone: model.phone,
    phoneVerified: model.phoneVerified,
    displayName: model.displayName,
    email: model.email,
    country: model.country,
    location: model.location,
    provider: model.provider,
    deviceToken: model.deviceToken,
    deviceType: model.deviceType,
    calcDistance: model.calcDistance,
    socialInfo: model.socialInfo,
    numFriends: model.numFriends,
    isMyFriend: model.isMyFriend,
    role: model.role,
    searchRadius: model.searchRadius,
    friendRequestSent: model.friendRequestSent,
    friendRequestReceived: model.friendRequestReceived
  };
}


