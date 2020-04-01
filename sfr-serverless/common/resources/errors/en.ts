import { ErrorKey } from "./types";

export default {
  
  [ErrorKey.ErrorUnknown]: "Unknown error",
  
  [ErrorKey.ProfileNotFound]: "Profile not found",
  [ErrorKey.EmailNotFound]: "Email not found",
  [ErrorKey.Unauthorized]: "Unauthorized user test",
  [ErrorKey.UsernameExisted]: "Username already exists",
  [ErrorKey.AuthExisted]: "Firebase Authorization is already existed",
  [ErrorKey.EmailExisted]: "Email already exists",
  [ErrorKey.IsAdmin]: "This action is forbidden",
  [ErrorKey.AllowForgotPassword]:
    "You are not able to reset password for this account, it has been used for Facebook login.",
  [ErrorKey.BinNotFound]: "Bin not found",
  [ErrorKey.BinIdNeeded]: "Bin Id needed",
  [ErrorKey.DeviceIdNeeded]: "Device Id needed",
  [ErrorKey.DeviceNotFound]: "Device not found",
  [ErrorKey.LatLongNeeded]: "Lat/long needed",
  [ErrorKey.PhoneExisted]: "Phone number already exists",
  [ErrorKey.InvalidFriendRequest]: "Invalid friend request",
  [ErrorKey.NotAFriend]: "The mentioned user is not a friend",
  [ErrorKey.SearchCoordinatesNeeded]: "Search Coordinates needed"
};
