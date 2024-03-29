import * as nodemailer from "nodemailer";
import { parseDataEmail, IParamEmail } from "../emails";
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export function emailPusher() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    return null;
  }

  console.log("ppppp",{
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  });
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
}

export async function sendEmail(options: ISentMail, form: IParamEmail) {
  try {
    // const pusher = emailPusher();
    const mailOptions = formatFormEmail(options, form);
    //if (!pusher || !mailOptions) { return null; }
    if (!mailOptions) { return null; }
    //return await pusher.sendMail(mailOptions);
    //return true;
    return await sgMail.send(mailOptions);
  } catch (error) {
    return Promise.reject(error);
  }
}
export interface ISentMail {
  emailsReceive: string | string[];
}

export function formatFormEmail(options: ISentMail, form: IParamEmail): nodemailer.SendMailOptions {
  const data = parseDataEmail(form);
  if (!data || !options.emailsReceive ||
    (Array.isArray(options.emailsReceive) && options.emailsReceive.length === 0)) { return null; }

  console.log({
    from: process.env.GMAIL_USER,
    to: options.emailsReceive,
    subject: data.emailSubjectTitle,
    html: data.emailBody
  });
  return {
    from: process.env.GMAIL_USER,
    to: options.emailsReceive,
    subject: data.emailSubjectTitle,
    html: data.emailBody
  };
}
