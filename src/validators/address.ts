import {Joi,Common,_} from "../config/routeImporter";

const addAddressRequest: Joi.ObjectSchema = Joi.object().keys({
    mapAddress: Joi.string().trim().optional().allow(null, "")
      .example("mapAddress")
      .description("The address as shown on the map")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'MAP_ADDRESS_MUST_BE_STRING') }),
  
    address: Joi.string().trim().optional().allow(null, "")
      .example("address")
      .description("The detailed address")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'ADDRESS_MUST_BE_STRING') }),
  
    city: Joi.string().trim().optional().allow(null, "")
      .example("city")
      .description("The city of the address")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'CITY_MUST_BE_STRING') }),
  
    state: Joi.string().trim().optional().allow(null, "")
      .example("state")
      .description("The state of the address")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'STATE_MUST_BE_STRING') }),
  
    zipCode: Joi.string().trim().optional().allow(null, "")
      .example("zipCode")
      .description("The postal code of the address")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'ZIP_CODE_MUST_BE_STRING') }),
  
    country: Joi.string().trim().optional().allow(null, "")
      .example("country")
      .description("The country of the address")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'COUNTRY_MUST_BE_STRING') }),
  
    landmark: Joi.string().trim().optional().allow(null, "")
      .example("landmark")
      .description("A nearby landmark to help identify the address")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'LANDMARK_MUST_BE_STRING') }),
  
    latitude: Joi.string().trim().optional().allow(null, "")
      .example("latitude")
      .description("The latitude of the address location")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'LATITUDE_MUST_BE_STRING') }),
  
    longitude: Joi.string().trim().optional().allow(null, "")
      .example("longitude")
      .description("The longitude of the address location")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'LONGITUDE_MUST_BE_STRING') }),

    geoLocation: Joi.any().optional().allow(null, "")
      .example("longitude")
      .description("The longitude of the address location")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'LONGITUDE_MUST_BE_STRING') }),
  
    addressLine1: Joi.string().trim().optional().allow(null, "")
      .example("addressLine1")
      .description("The first line of the address")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'ADDRESS_LINE_1_MUST_BE_STRING') }),
  
    addressLine2: Joi.string().trim().optional().allow(null, "")
      .example("addressLine2")
      .description("The second line of the address")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'ADDRESS_LINE_2_MUST_BE_STRING') }),

    name: Joi.string().trim().optional().allow(null, "")
      .example("label")
      .description("label of the address")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'NAME_MUST_BE_STRING') }),
    
    countryCode: Joi.string().trim().optional().allow(null, "")
      .example("phone")
      .description("phone associated with that address")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'COUNTRY_CODE_MUST_BE_STRING') }),

    phone: Joi.string().trim().optional().allow(null, "")
      .example("phone")
      .description("phone associated with that address")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'PHONE_MUST_BE_STRING') }),

    entityType: Joi.string().trim().optional().allow(null, "").valid(null, "buyer", "seller", "store")
      .example("buyer | seller | store")
      .description("phone associated with that address")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'ENTITY_TYPE_MUST_BE_STRING') }),

    addressType: Joi.string().trim().optional().allow(null, "").valid(null, "pickup", "return", "other")
      .example("pickup | return | other")
      .description("phone associated with that address")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'ADDRESS_TYPE_MUST_BE_STRING') }),

    shopId: Joi.number().optional().allow(null)
      .example(123)
      .description("Specifies the shop ID for filtering addresses")
      .default(null)
      .error(errors => { return Common.routeError(errors, 'SHOP_ID_MUST_BE_NUMBER') }),
  }).label('add-address-request')
    .description("Schema for validating the add address request, including map address, detailed address, city, state, zip code, country, landmark, latitude, longitude, and address lines 1 and 2."); 
    
const filterAddressRequest: Joi.ObjectSchema = Joi.object().keys({
      entityType: Joi.string().trim().optional().allow(null).valid(null, "buyer", "seller", "store")
        .example("buyer | seller | store")
        .description("Specifies the type of entity associated with the address (e.g., buyer, seller, store)")
        .default(null)
        .error(errors => { return Common.routeError(errors, 'ENTITY_TYPE_MUST_BE_STRING') }),
    
      addressType: Joi.string().trim().optional().allow(null).valid(null, "pickup", "return", "other")
        .example("pickup | return | other")
        .description("Specifies the type of address (e.g., pickup, return, other)")
        .default(null)
        .error(errors => { return Common.routeError(errors, 'ADDRESS_TYPE_MUST_BE_STRING') }),
    
      shopId: Joi.number().optional().allow(null)
        .example(123)
        .description("Specifies the shop ID for filtering addresses")
        .default(null)
        .error(errors => { return Common.routeError(errors, 'SHOP_ID_MUST_BE_NUMBER') }),
    
    }).label('filter-address-request')
      .description("Schema for validating the filter address request, including entity type, address type, and shop ID.");

    

export { addAddressRequest, filterAddressRequest }