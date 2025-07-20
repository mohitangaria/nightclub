import { Joi, Common, _ } from "../config/routeImporter";

const createShopRequest: Joi.ObjectSchema = Joi.object().keys({
  contactName: Joi.string().trim().required()
    .example("John Doe")
    .description("The name of the contact person for the shop.")
    .error(errors => { return Common.routeError(errors, 'CONTACT_NAME_MUST_BE_STRING') }),

  contactEmail: Joi.string().trim().optional().allow(null)
    .example("contact@example.com")
    .description("The contact email address for the shop. Can be null if not provided.")
    .default(null)
    .error(errors => { return Common.routeError(errors, 'CONTACT_EMAIL_MUST_BE_STRING') }),

  contactCountryCode: Joi.string().trim().optional().allow(null)
    .example("+1")
    .description("The country code for the contact phone number. Can be null if not provided.")
    .default(null)
    .error(errors => { return Common.routeError(errors, 'CONTACT_COUNTRY_CODE_MUST_BE_STRING') }),

  contactPhone: Joi.string().trim().optional().allow(null)
    .example("1234567890")
    .description("The contact phone number for the shop. Can be null if not provided.")
    .default(null)
    .error(errors => { return Common.routeError(errors, 'CONTACT_PHONE_MUST_BE_STRING') }),

  code: Joi.string().trim().regex(/^[a-zA-Z0-9-]+$/).required()
    .example("shop-123")
    .description("The unique subdomain code for the shop, containing only valid characters, numbers, and hyphens.")
    .error(errors => { return Common.routeError(errors, 'SUBDOMAIN_CODE_INVALID') }),

  name: Joi.string().trim().required()
    .example("Shop Name")
    .description("The name of the shop. Must be a non-empty string.")
    .error(errors => { return Common.routeError(errors, 'SHOP_NAME_MUST_BE_STRING') }),

  description: Joi.string().trim().optional().allow(null, "")
    .example("A brief description of the shop")
    .description("An optional description of the shop. Can be null or an empty string if not provided.")
    .default(null)
    .error(errors => { return Common.routeError(errors, 'DESCRIPTION_MUST_BE_STRING') }),
}).label('create-shop-request')
    .description("Schema for validating the request to create a shop, including contact details, shop subdomain code, name, and optional description.");
    
const generateUrlRequest: Joi.ObjectSchema = Joi.object().keys({
  code: Joi.string().trim().regex(/^[a-zA-Z0-9-]+$/).required()
    .example("shop-123")
    .description("The subdomain code, which must include only valid characters (letters, numbers, and hyphens).")
    .error(errors => { return Common.routeError(errors, 'SUBDOMAIN_CODE_INVALID') }),
}).label('generate-url-request')
  .description("Schema for validating a subdomain code used to generate URLs. Ensures that the code contains only valid characters such as letters, numbers, and hyphens.");
    

const listShopRequest: Joi.ObjectSchema = Joi.object().keys({
  userId: Joi.number().optional().allow(null).default(null)
    .description("The user ID for filtering the shop list. If not provided, no user-specific filter is applied."),

  searchText: Joi.string().trim().optional().allow(null)
    .description("Text used for searching shops. If not provided, the search is not filtered by text."),

  page: Joi.number().optional().min(1).default(1)
    .description("The page number for pagination. Defaults to 1 if not provided."),

  perPage: Joi.number().integer().optional().min(1).default(+process.env.PAGINATION_LIMIT!)
    .description("The number of items to display per page. Defaults to the value defined in the environment variable `PAGINATION_LIMIT`.")
}).label('list-shop-request')
  .description("Schema for requesting a list of shops with optional filters and pagination settings.");
  

const shopSettingsRequest: Joi.ObjectSchema = Joi.object().keys({
  bankAccountId: Joi.number().integer().optional().allow(null).default(null)
    .description("bank account id if linked, can be null")
    .example(1),

  slots: Joi.array().optional().allow(null).default(null)
    .description("Slot object containing shop slot settings, can be null")
    .example([{ startTime: "09:00", endTime: "17:00" }]),

  settings: Joi.object().optional().allow(null).default(null)
    .description("Settings object containing additional shop settings, can be null")
    .example({ key1: "value1", key2: "value2" }),

  attachments: Joi.array().optional().allow(null).default(null)
    .description("Settings object containing additional shop settings, can be null")
    .example([{ type: "cover", attachmentId: 1 }]),

  meta: Joi.object().optional().allow(null).default(null)
    .description("Settings object containing additional shop settings, can be null")
    .example({ key1: "value1", key2: "value2" }),
  
  social: Joi.object().optional().allow(null).default(null)
    .description("Settings object containing additional shop settings, can be null")
    .example({ key1: "value1", key2: "value2" }),
}).label('shop-settings-request').description('Request for updating shop settings');

// const shopSettingsRequest: Joi.ObjectSchema = Joi.object().keys({
//   bankAccountId: Joi.number().integer().optional().allow(null).default(null)
//     .description("Bank account ID if linked, can be null")
//     .example(1),

//   slots: Joi.array().optional().allow(null).default(null)
//     .description("Slot object containing shop slot settings, can be null")
//     .example([{ startTime: "09:00", endTime: "17:00" }]),

//   settings: Joi.object().optional().allow(null).default(null)
//     .description("Settings object containing additional shop settings, can be null")
//     .example({ key1: "value1", key2: "value2" }),

//   attachments: Joi.array().optional().allow(null).default(null)
//     .description("Attachments object containing additional shop settings, can be null")
//     .example([{ type: "cover", attachmentId: 1 }]),

//   meta: Joi.object().optional().allow(null).default(null)
//     .description("Meta object containing additional shop settings, can be null")
//     .example({ key1: "value1", key2: "value2" }),

//   social: Joi.alternatives().try(
//     Joi.object({
//       tikTok: Joi.string().uri().required()
//         .description("TikTok profile URL")
//         .example("https://www.tiktok.com/"),

//       twitter: Joi.string().uri().required()
//         .description("Twitter profile URL")
//         .example("https://www.twitter.com/"),

//       youtube: Joi.string().uri().required()
//         .description("YouTube profile URL")
//         .example("https://www.youtube.com/"),

//       facebook: Joi.string().uri().required()
//         .description("Facebook profile URL")
//         .example("https://www.facebook.com/"),

//       instagram: Joi.string().uri().required()
//         .description("Instagram profile URL")
//         .example("https://www.instagram.com/"),

//       pinterest: Joi.string().uri().required()
//         .description("Pinterest profile URL")
//         .example("https://www.pinterest.com/"),
//     }).required(),
//     Joi.valid(null)
//   )
//   .description("Social media URLs, including TikTok, Twitter, YouTube, Facebook, Instagram, and Pinterest, all required if social is present")
//   .example({
//     tikTok: "https://www.tiktok.com/",
//     twitter: "https://www.twitter.com/",
//     youtube: "https://www.youtube.com/",
//     facebook: "https://www.facebook.com/",
//     instagram: "https://www.instagram.com/",
//     pinterest: "https://www.pinterest.com/"
//   }),

// }).label('shop-settings-request')
//   .description('Request schema for updating shop settings, including bank account, slots, settings, attachments, meta, and social media URLs, where all social fields are required if social data is present.');


  
export { createShopRequest, listShopRequest, shopSettingsRequest, generateUrlRequest };
  