export enum EmailTemplateType {
  NewUser = "new_user",
  NewUserAdmin = "new_user_admin",
  ApproveUserAdmin = "approve_user_admin",
  ApproveUser = "approve_user",
  RejectUserAdmin = "reject_user_admin",
  RejectUser = "reject_user"
}

export interface IParamBasicTemplateEmail {
  title?: {
    [key: string]: string
  };
  content?: {
    [key: string]: string
  };
}

export interface IParamTemplateEmail {
  title: string;
  content: string;
}

export interface ITemplateEmail {
  [key: string]: IParamTemplateEmail;
}
