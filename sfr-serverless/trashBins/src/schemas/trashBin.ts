import * as Joi from "joi";
// import { Gender, Provider, Subscription, LookingFor, Options, SunSign, StatusCode } from "../../../common";

export const UpdateBinSchema = Joi.object({
  binId: Joi.string().allow("").required(),
  remarks: Joi.string().allow("").optional(),
  longitude: Joi.number().allow("").required(),
  latitude: Joi.number().allow("").required(),
  altitude: Joi.number().default("0").optional(),
  imageUrl: Joi.string().allow("").optional()

});
export const NewBinSchema = Joi.object({
    remarks: Joi.string().allow("").optional(),
    longitude: Joi.number().allow("").required(),
    latitude: Joi.number().allow("").required(),
    altitude: Joi.number().default("0").optional(),
    imageUrl: Joi.string().allow("").optional()
  
  })