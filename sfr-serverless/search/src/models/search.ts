import * as mongoose from "mongoose";
import { IModelBase, SchemaBase } from "../../../common";
import { UserSchemaName } from '../../../common/models/user';
import { ILocation } from "../../../location/src/models";

export interface IUserSearchSurf extends IModelBase{
    userId: string,
    searchSettings: Object,
    responseJson: Object,
    location: ILocation
}

export const SearchSurfSchemaName = "search";

const SearchSurfSchema = new mongoose.Schema(SchemaBase({
  userId: {
    required: true,
    type: mongoose.SchemaTypes.ObjectId,
    ref: UserSchemaName
  },
  searchSettings: Object,
  responseJson: Object,
  location: Object
}), {
  timestamps: true
});

//LocationSchema.index({ referenceId: 1, createdBy: 1, type: 1 }, { unique: true });

export const UserSearch = mongoose.model<IUserSearchSurf>(SearchSurfSchemaName, SearchSurfSchema);
