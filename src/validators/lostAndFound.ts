import { Joi, Common } from "../config/routeImporter";

/**
 * Validator for creating a lost or found item.
 */
const createLostAndFoundRequest: Joi.ObjectSchema = Joi.object().keys({
  type: Joi.number().valid(1, 2).required()
    .description("Type of entry: 1 for Lost, 2 for Found.")
    .example(1)
    .error(errors => Common.routeError(errors, 'TYPE_MUST_BE_VALID')),

  itemName: Joi.string().trim().required()
    .description("Name of the item that is lost or found.")
    .example("Wallet")
    .error(errors => Common.routeError(errors, 'ITEM_NAME_MUST_BE_STRING')),

  itemDescription: Joi.string().trim().optional().allow(null, "")
    .description("Optional description of the lost or found item.")
    .example("Black leather wallet")
    .default(null)
    .error(errors => Common.routeError(errors, 'ITEM_DESCRIPTION_MUST_BE_STRING')),

  lostOrFoundDate: Joi.date().optional().allow(null)
    .description("The date the item was lost or found.")
    .example("2025-07-20")
    .default(null)
    .error(errors => Common.routeError(errors, 'DATE_MUST_BE_VALID')),

  eventId: Joi.number().optional().allow(null)
    .description("Event ID related to the lost/found item.")
    .example(123)
    .default(null),

  bookingId: Joi.number().optional().allow(null)
    .description("Booking ID related to the lost/found item.")
    .example(456)
    .default(null),

  contactCountryCode: Joi.string().trim().optional().allow(null)
    .description("Country code for contact number.")
    .example("+91")
    .default(null)
    .error(errors => Common.routeError(errors, 'CONTACT_COUNTRY_CODE_MUST_BE_STRING')),

  contactNumber: Joi.string().trim().optional().allow(null)
    .description("Contact number of the owner.")
    .example("9876543210")
    .default(null)
    .error(errors => Common.routeError(errors, 'CONTACT_NUMBER_MUST_BE_STRING')),

  attachmentId: Joi.number().optional().allow(null)
    .description("Attachment ID if any image is linked with the lost/found item.")
    .example(22)
    .default(null),

  itemBelongsTo: Joi.number().optional().allow(null)
    .description("User ID to whom the item belongs.")
    .example(77)
    .default(null),

  ownerFound: Joi.boolean().optional().allow(null)
    .description("Boolean indicating if the owner has been found.")
    .example(false)
    .default(false),

  proofOfOwner: Joi.string().optional().allow(null, "")
    .description("Proof of ownership provided.")
    .example("ID Card")
    .default(null),

  comment: Joi.string().optional().allow(null, "")
    .description("Optional comment for internal notes.")
    .example("Left at the registration desk")
    .default(null),

  slot: Joi.string().optional().allow(null, "")
    .description("Time slot or shift when item was found/lost.")
    .example("Evening")
    .default(null),

}).label("create-lost-and-found-request")
  .description("Schema for creating a lost or found item entry.");

/**
 * Validator for listing lost/found items with optional filters.
 */
const listLostAndFoundRequest: Joi.ObjectSchema = Joi.object().keys({
  userId: Joi.number().optional().allow(null)
    .description("User ID for filtering items created by user."),

  eventId: Joi.number().optional().allow(null)
    .description("Event ID for filtering lost/found items."),

  searchText: Joi.string().trim().optional().allow(null)
    .description("Search keyword to filter lost/found item name or description."),

  page: Joi.number().optional().min(1).default(1)
    .description("Pagination page number."),

  perPage: Joi.number().integer().optional().min(1).default(+process.env.PAGINATION_LIMIT!)
    .description("Number of results per page."),
}).label("list-lost-and-found-request")
  .description("Schema for listing lost or found items with optional filters and pagination.");

/**
 * Validator for updating a lost or found item.
 */
const updateLostAndFoundRequest: Joi.ObjectSchema = Joi.object().keys({
//   id: Joi.number().required()
//     .description("ID of the lost/found item to update.")
//     .example(1001),

  itemDescription: Joi.string().optional().allow(null, "")
    .description("Updated description of the item.")
    .example("Updated description"),

  itemBelongsTo: Joi.number().optional().allow(null)
    .description("Updated owner ID to whom the item belongs.")
    .example(88),

  ownerFound: Joi.boolean().optional().allow(null)
    .description("Boolean indicating if the item has been claimed.")
    .example(true),

  proofOfOwner: Joi.string().optional().allow(null, "")
    .description("Updated proof of ownership.")
    .example("Updated proof"),

  comment: Joi.string().optional().allow(null, "")
    .description("Updated comment.")
    .example("Updated comment"),

  attachmentId: Joi.number().optional().allow(null)
    .description("Updated attachment ID.")
    .example(35),

  slot: Joi.string().optional().allow(null, "")
    .description("Updated slot.")
    .example("Morning"),
}).label("update-lost-and-found-request")
  .description("Schema for updating an existing lost or found item.");

/**
 * Validator for changing the status of a lost/found item.
 */
const updateLostAndFoundStatusRequest: Joi.ObjectSchema = Joi.object().keys({
  state: Joi.number().required()
    .description("ID of the lost/found item to update.")
    .example(202),

  status: Joi.number().valid(0, 1).required()
    .description("Status to update: 0 for inactive, 1 for active.")
    .example(1),
}).label("update-lost-and-found-status-request")
  .description("Schema for updating status (active/inactive) of a lost or found item.");

/**
 * Validator for fetching details of a specific item by ID.
 */
const fetchLostAndFoundDetailsRequest: Joi.ObjectSchema = Joi.object().keys({
  id: Joi.number().required()
    .description("ID of the lost or found item to fetch.")
    .example(110),
}).label("fetch-lost-and-found-details-request")
  .description("Schema for fetching details of a lost or found item by ID.");

/**
 * Validator for identity
 */
const identifierRequest=Joi.object().keys({
    id:Joi.number().required().example(1).description("Unique identifier for the post"),
}).label('identifier').description('Identifier')

export {
  createLostAndFoundRequest,
  listLostAndFoundRequest,
  updateLostAndFoundRequest,
  updateLostAndFoundStatusRequest,
  fetchLostAndFoundDetailsRequest,
  identifierRequest
};
