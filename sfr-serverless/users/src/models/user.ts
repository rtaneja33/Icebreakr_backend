import { Permissions, IPhone, Gender} from "../../../common";

export interface IUserFormCreate {
    authId?: string;
    displayName? : string;
    cityOfOrigin? : string;
    companyName? : string;
    email? : string;
    permissions?: Permissions[];
    alumnusStatus? : Gender;
    alumnusOfSchool?: string;
    phone? : IPhone;
    jobTitle?: string;
    avatar?: string;
    coordinates?: number[];
    location?: Object;
}

export interface IUserChatCreateForm {
    toUserId: string;
    message: string;
    createdBy: string;
}
