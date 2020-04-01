import * as Joi from "joi";
import { Gender, Provider, Subscription, LookingFor, Options, SunSign, StatusCode } from "../../../common";

export const UpdateUserSchema = Joi.object({
  firstName: Joi.string().allow(""),
  lastName: Joi.string().allow(""),
  city: Joi.string().allow(""),
  country: Joi.string().allow("").optional(),
  email: Joi.string().allow(""),
  phone: Joi.object({
    phoneNumber: Joi.number().allow(""),
    phoneCode: Joi.string().allow("")
  }),

  // avatar: string;
  // companyName: string;
  // jobTitle: string;
  // alumnusStatus: AlumnusStatus;
  // currentAttendingSchool: string;
  // alumnusOfSchool: string;
  // cityOfOrigin: string;
  // phone: IPhone;
  // phoneVerified: boolean;
  // displayName: string;
  // email: string;
  // country: string;
  // location: ILocation;
  // provider: Provider;
  // deviceToken: string;
  // deviceType: string;
  // calcDistance: number;
  // socialInfo: Object;
});

export const AllowForPasswordSchema = Joi.object({
  email: Joi.string().required()
});
