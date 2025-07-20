import * as Hapi from "@hapi/hapi";
import { Models, sequelize } from "../models";
import { Sequelize, Op } from "../config/dbImporter";
import * as Common from "./common";
import Moment from "moment";
import * as Constants from "../constants";
import { Literal, Fn } from "sequelize/types/utils";
import { _ } from "../config/routeImporter";
import * as handlebars from 'handlebars';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import axios from 'axios';
import fs from 'fs-extra';

export async function getAccessToken(): Promise<string> {
  
    const auth = new GoogleAuth({
        keyFile: path.join(__dirname,process.env.GOOGLE_APPLICATION_CREDENTIALS!),
        scopes: 'https://www.googleapis.com/auth/firebase.messaging',
    });
  
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    return accessTokenResponse?.token || "";
}

export async function fireNotification(notificationData: {title: any, body: any, data: any}, sessionIds: string[]): Promise<void> {
    let aa = path.join(__dirname,process.env.GOOGLE_APPLICATION_CREDENTIALS!);
    console.log(aa, 'GOOGLE_APPLICATION_CREDENTIALSss')
    console.log(path.join(__dirname,process.env.GOOGLE_APPLICATION_CREDENTIALS!), 'GOOGLE_APPLICATION_CREDENTIALSs');
    let data = fs.readFileSync(aa, 'utf8');
    let projectId = "";
    if(data){
      data = JSON.parse(data);
      if(data && data?.project_id){
        projectId = data?.project_id
      }
    }
    
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
   
    if(sessionIds && sessionIds.length > 0){
      for(const [index, obj] of sessionIds.entries()){
        const accessToken = await getAccessToken();
        const headers = {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; UTF-8',
        };
        try {
          let message = {
            message:{
              token: obj,
              notification: {
                title: notificationData?.title,
                body: notificationData?.body
              },
              data: {
                title: notificationData?.title,
                body: notificationData?.body,
                data: JSON.stringify(notificationData.data)
              }
            }
            
          }
          console.log(message, 'mmmmmmmmmmmmm')
          const response = await axios.post(url, message, { headers });
          //return response?.data;
          console.log(response, 'rrrrrrrrrr');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Error sending message:', error.response.data);
            } else {
                console.error('Error sending message:', error);
            }
            
        }
      }
    }
    
  }

export const generateNotification = async(type: string, replacements: { [key: string]: any }, users: number[], data: { [key: string]: any }, language: string) => {
    try {
        const notificationInfo = await Models.NotificationTemplate.findOne({
            where: { type: type },
            include: [
                {
                    model: Models.NotificationTemplateContent, as: "content",
                    include: [
                        {
                            model: Models.Language, where: { code: language }
                        }
                    ]
                },
                {
                    required: true,
                    model: Models.NotificationTemplateContent, as: "defaultContent",
                    include: [
                        {
                            model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE }
                        }
                    ]
                }
            ]
        });
        if(!notificationInfo) {
            return { success: false, message: "INVALID_NOTIFICATION_TYPE", data: null }
        }

        const title = notificationInfo.content ? notificationInfo.content.title : notificationInfo.defaultContent!.title;
        const content = notificationInfo.content ? notificationInfo.content.content : notificationInfo.defaultContent!.content;

        let titleTemplate = handlebars.compile(title);
        let contentTemplate = handlebars.compile(content);

        const compiledTitle = titleTemplate(replacements);
        const compiledContent = contentTemplate(replacements);

        const createNotification = await Models.Notification.create({
            userId: users[0],
            notificationTemplateId: notificationInfo.id,
            type: type,
            title: title,
            content: content,
            replacements: replacements,
            compiledTitle: compiledTitle,
            compiledContent: compiledContent,
            notificationObject: data
        });

        return { success: true, message: "REQUEST_SUCCESSFULL", data: createNotification }

    } catch (error) {
        console.log(error)
    }
}

