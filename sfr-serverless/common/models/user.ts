import * as mongoose from "mongoose";
import { IModelBase, IPhone, SchemaBase, StatusCode } from "./common";
import { Permissions } from "./permissions";
import { IUserAdditionalInfo } from './userAdditionalInfo';
import { IUserControlPreference } from './controlPreferences';
import { ILocation } from "./location";

export enum Gender {
  Male = "Male",
  Female = "Female"
}

export enum Role {
  Admin = "Admin",
  User = "User"
}

export enum Provider {
  Facebook = "facebook",
  LinkedIn = "linkedIN",
  Email = "email",
  Phone = "phone"
}

export enum Subscription {
	FREE = "free",
	SURF_UNLIMTED = "unlimited"
}

export enum SurfProfile {
  SURFDATE = "surfDate",
  SURFBUDDY = "surfBuddy"
}

export enum AlumnusStatus {
  AlumnusOf = "Alumnus of",
  CurrentlyAttending = "Currently Attending"
}

export const UserSchemaName = "users";

export interface IUser extends IModelBase {
 
  authId: string;
 
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
  searchRadius: number;
  isMyFriend: boolean;
  friendRequestSent: boolean;
  friendRequestReceived: boolean;
  role: Role;
}

const UserSchema = new mongoose.Schema(SchemaBase({
  authId: {
    type: String,
    required: true,
    unique: true
  },
  avatar: String,
  companyName: String,
  jobTitle: String,
  alumnusStatus: String,
  currentAttendingSchool: String,
  alumnusOfSchool: String,
  cityOfOrigin: String,
  phone: Object,
  phoneVerified: Boolean,
  displayName: String,
  email: String,
  country: String,
  searchRadius: Number,
  location: Object,
  deviceToken: String,
  deviceType: String,
  socialInfo: Object,
  role: String,
  permissions: {
    type: [String],
    default: []
  },
  numFriends: Number,
  provider: {
    type: String,
    default: Provider.Phone
  }
}), {
  timestamps: true
});

export const User = mongoose.model<IUser>(UserSchemaName, UserSchema);

export function getNameUser(model: IUser): string {
  let name = model.displayName;
  if (name.length > 20) {
    name = name.slice(0, 20) + "...";
  }

  return name;
}
