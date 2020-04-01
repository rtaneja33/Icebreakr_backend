
import * as lodash from "lodash";
import resourcesNotification from "./en";
import { NotificationKeyType } from "./types";

export * from "./types";

export interface IParamsNotification {
  content?: object;
  title?: object;
}
export interface IOptionNotification {
  params?: IParamsNotification;
}

export interface INotificationContent {
  title: string;
  content: string;
}

export function getTitleOfNotificationKey(key:NotificationKeyType) {
  const notification: INotificationContent = <any> lodash.cloneDeep(resourcesNotification[key]);
  if(!notification) {
    return null;
  } else {
    return notification.title;
  }
}

export function getContentNotification(key: NotificationKeyType, opts: IOptionNotification = {}): INotificationContent {
  const notification: INotificationContent = <any> lodash.cloneDeep(resourcesNotification[key]);
  if (!notification) {
    console.log("Cannot find content notification with key " + key);

    return null;
  }
  console.log("Opt params: ", opts.params);
  console.log("Notification: ", notification);
  return opts.params ? parseContentNotification(notification, opts.params) : notification;
}

export function parseContentNotification(
  notification: INotificationContent, params: IParamsNotification
): INotificationContent {
  const delimiterLeft = "{{";
  const delimiterRight = "}}";

  const keyParamsContent = Object.keys(params.content || {});
  const keyParamsTitle = Object.keys(params.title || {});

  console.log("keyParamsContent: ", keyParamsContent);
  console.log("keyParamsTitle: ", keyParamsTitle);

  if (keyParamsContent.length > 0) {
    keyParamsContent.forEach((e) => {
      notification.content = notification.content.replace(delimiterLeft + e + delimiterRight, params.content[e]);
    });
  }

  if (keyParamsTitle.length > 0) {
    keyParamsTitle.forEach((e) => {
      notification.title = notification.title.replace(delimiterLeft + e + delimiterRight, params.title[e]);
    });
  }

  console.log("Notification: ", notification);
  return notification;
}
