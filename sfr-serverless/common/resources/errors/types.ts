export enum ErrorKey {
  ErrorUnknown = "error_unknown",
  ProfileNotFound = "404",
  Unauthorized = "unauthorized",
  IsAdmin = "is_admin",
  AllowForgotPassword = "allow_forgot_password",

  
  UsernameExisted = "username_existed",
  InvalidFriendRequest = "invalid_friend_request",
  AuthExisted = "auth_existed",
  EmailExisted = "email_existed",
  PhoneExisted = "phone_existed",
  EmailNotFound = "email_not_found",
  BinIdNeeded = "bin_id_needed",
  BinNotFound = "bin_not_found",
  DeviceIdNeeded = "device_id_needed",
  DeviceNotFound = "device_not_found",
  LatLongNeeded = "lat_lng_needed",
  NotAFriend = "not_a_friend",
  SearchCoordinatesNeeded = "search_coordinates_needed"
}
