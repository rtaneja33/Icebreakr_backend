import * as lodash from "lodash";
import { newUserTemplate, newUserAdminTemplate, approveUserAdminTemplate, approveUserTemplate, rejectUserAdminTemplate, rejectedUserTemplate } from "./templates";
import { EmailTemplateType, IParamBasicTemplateEmail, ITemplateEmail } from "./types";
export * from "./types";

export const emailTemplates: ITemplateEmail = {
  [EmailTemplateType.NewUser.toString()]: {
    title: "Welcome to Lynksin-Golf",
    content: newUserTemplate
  },
  [EmailTemplateType.NewUserAdmin.toString()]: {
    title: "Email inform about new user to admin users",
    content: newUserAdminTemplate
  },
  [EmailTemplateType.ApproveUserAdmin.toString()]: {
    title: "Email inform about approval of user to admin users",
    content: approveUserAdminTemplate
  },
  [EmailTemplateType.ApproveUser.toString()]: {
    title: "Lynksin-Golf User Approved",
    content: approveUserTemplate
  },
  [EmailTemplateType.RejectUserAdmin.toString()]: {
    title: "Email inform about rejection of user to admin users",
    content: rejectUserAdminTemplate
  },
  [EmailTemplateType.RejectUser.toString()]: {
    title: "Lynksin-Golf User Rejected",
    content: rejectedUserTemplate
  }
};

export interface IParamEmail {
  type: EmailTemplateType;
  params?: IParamBasicTemplateEmail;
}

export function parseParam(params: object, text: string) {
  console.log("Object.keys(params)", Object.keys(params));
  if (params && Object.keys(params).length > 0) {
    Object.keys(params).forEach((e) => {
      text = text.replace(`{{${e}}}`, params[e]);
    });
  }

  return text;
}

export function parseDataEmail(options: IParamEmail) {
  const emailTemplate = lodash.cloneDeep(emailTemplates[options.type]);
  if (!emailTemplate) { return null; }
  const keysEmailTemplate = Object.keys(emailTemplate);
  const paramsTemplate = options.params;
  if (paramsTemplate) {
    Object.keys(paramsTemplate).forEach((e) => {
      if (paramsTemplate[e] && keysEmailTemplate.includes(e)) {
        emailTemplate[e] = parseParam(paramsTemplate[e], emailTemplate[e]);
      }
    });
  }

  return {
    emailBody: emailTemplate.content,
    emailSubjectTitle: emailTemplate.title
  };
}
