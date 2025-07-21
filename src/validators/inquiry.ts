import Joi from "joi";
import * as Constants from "../constants";

// Create & Update Inquiry Payload
export const inquiryRequest = Joi.object({
  name: Joi.string().required().description("Name of the inquiry"),
  date: Joi.date().required().description("Date of the inquiry"),
  bookingId: Joi.number().optional().allow(null).description("Booking ID"),
  eventId: Joi.number().optional().allow(null).description("Event ID"),
  slot: Joi.string().optional().allow(null).description("Event slot"),
  partySize: Joi.string().optional().allow(null).description("Party size"),
  message: Joi.string().optional().allow(null).description("Message"),
  contactCountryCode: Joi.string().optional().allow(null).description("Country Code"),
  contactNumber: Joi.string().required().description("Contact number")
});

// ID Param Validator (for get/update/delete/status routes)
export const inquiryIdentity = Joi.object({
  id: Joi.number().required().description("Inquiry ID")
});

// Status Update Payload
export const inquiryStatusRequest = Joi.object({
  status: Joi.number()
    .valid(...Object.values(Constants.USER_STATUS))
    .required()
    .description("New status")
});

// List Queries for Admin or User
export const listInquiryRequest = Joi.object({
  page: Joi.number().optional().min(1).default(1)
  .description("Pagination page number."),
   perPage: Joi.number().integer().optional().min(1).default(+process.env.PAGINATION_LIMIT!)
   .description("Number of results per page."),
  search: Joi.string().optional().allow("", null).description("Search keyword"),
  eventId: Joi.number().optional().allow(null).description("Filter by Event ID"),
  bookingId: Joi.number().optional().allow(null).description("Filter by Booking ID"),
  fromDate: Joi.date().optional().description("Start Date"),
  toDate: Joi.date().optional().description("End Date")
});
