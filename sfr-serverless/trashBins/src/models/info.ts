import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "../../../common";

export interface Iinfo extends IModelBase {
  info: string;
}

export const InfoSchemaName = "infos";

const InfoSchema = new mongoose.Schema(SchemaBase({
  info: String
}));

export const Info = mongoose.model<Iinfo>(
  InfoSchemaName, InfoSchema
);
