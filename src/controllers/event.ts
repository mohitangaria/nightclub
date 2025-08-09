import { Models, sequelize } from "../models";
import * as Common from './common';
import _ from "lodash";
import { Sequelize, Op } from "../config/dbImporter";
import requestIp from 'request-ip';
import * as Hapi from "@hapi/hapi";
import { Literal, Fn } from "sequelize/types/utils";
import axios from "axios";

type AttributeElement = string | [Literal, string] | [Fn, string];



  
  export const listAllEvents = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        const response = await axios.get(
            "https://prod-seetickets-core.seeticketsusa.us/api/v2/client/137577/event",
            {
              headers: {
                "api-key": process.env.SEE_TICKETS_API_KEY || "",
                "api-secret": process.env.SEE_TICKETS_API_SECRET || "",
              },
            }
          );
      
         // The events returned by SeeTickets
          const events = response.data;
      
     
  
      return h.response({
        message: request.i18n.__("RECORDS_FETCHED_SUCCESSFULLY"),
        responseData: events
      }).code(200);
    } catch (err) {
      return Common.generateError(request, 500, 'FAILED_TO_FETCH_RECORDS', err);
    }
  };

  