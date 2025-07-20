import { Joi, Common, _ } from "../config/routeImporter";



  
const productRequest: Joi.ObjectSchema = Joi.object().keys({
    name: Joi.string().trim().required().error(errors => { return Common.routeError(errors, 'PRODUCT_NAME_IS_REQUIRED') }).example("Tshirt").description('Name of the product'),
    attachmentId: Joi.number().required().example(101).description('Main image of the product'),
    storeId: Joi.number().required().example(101).description('Store id'),
    categoryId: Joi.number().required().example(101).description('Category id'),
    basePrice: Joi.number().required().example(101).description('Base price'),
    sku: Joi.string().required().example(101).description('SKU of the product'),
    description: Joi.string().required().example(101).description('Description of the product'),
    keywords: Joi.string().optional().example("").description('Keywords for the product'),
    brandId: Joi.number().required().example(101).description('Product id'),
    rent: Joi.boolean().optional().valid(true, false).description("Is available for rent"),
    buy: Joi.boolean().optional().valid(true, false).description("Is available for buying"),
    preLoved: Joi.boolean().optional().valid(true, false).description("Can be sold as used product"),
    rentalDurationType: Joi.when('rent', {
        is: true,
        then: Joi.number().required(),
        otherwise: Joi.number().optional().allow(null)
    }),
    rentalDuration: Joi.when('rent', {
        is: true,
        then: Joi.number().required(),
        otherwise: Joi.number().optional().allow(null)
    }),
    rentalPrice: Joi.when('rent', {
        is: true,
        then: Joi.number().required(),
        otherwise: Joi.number().optional().allow(null)
    }),
    securityDeposit: Joi.when('rent', {
        is: true,
        then: Joi.number().required(),
        otherwise: Joi.number().optional().allow(null)
    }),
    prepDays: Joi.when('rent', {
        is: true,
        then: Joi.number().required(),
        otherwise: Joi.number().optional().allow(null)
    }),
    preLovedPrice: Joi.when('preLoved', {
        is: true,
        then: Joi.number().required(),
        otherwise: Joi.number().optional().allow(null)
    }),
    attributes: Joi.array().items(
        Joi.object().keys({
            attributeId: Joi.number().required()
            .example(1)
            .description("The ID of the attribute. Must be a number.")
            .error(errors => { return Common.routeError(errors, 'ATTRIBUTE_ID_MUST_BE_NUMBER') }),
            values: Joi.alternatives().try(
                Joi.string().trim().required()
                .example('Red')
                .description("The value of the attribute. Must be a string."),
                Joi.array().items(Joi.string().trim().required())
                .example(['Red', 'Blue'])
                .description("The value of the attribute as an array of strings.")
            ).required()
                .description("The value of the attribute. Can be a string or an array of strings.")
                .error(errors => { return Common.routeError(errors, 'VALUE_MUST_BE_STRING_OR_ARRAY') })
            })
      ).required()
        .description("An array of attribute objects, each containing an attributeId and a value.")
        .error(errors => { return Common.routeError(errors, 'ATTRIBUTES_MUST_BE_ARRAY_OF_OBJECTS') })
}).or('rent', 'buy', 'preLoved')
.error(errors => { return Common.routeError(errors, 'AT_LEAST_ONE_OF_RENT_BUY_PRELOVED_MUST_BE_TRUE') })
.label('product-request').description('Payload object for creating a new product');

const listProductRequest: Joi.ObjectSchema = Joi.object().keys({
    searchText: Joi.string().trim(),
    page: Joi.number().optional().min(1).default(1),
    perPage: Joi.number().integer().optional().min(1).default(+process.env.PAGINATION_LIMIT!),
    productType: Joi.number().optional().valid(1,2,3).default(1),
    storeId: Joi.number().required(),
    parentProductId: Joi.number().optional(),
}).label('product-list-request').description('Product list request ');

const productIdentity: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().required().example(1).description("Unique identifier for the product"),
}).label('product-identity').description('Identifier for product');

const productApprovalRequest: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().required().example(1).description("Unique identifier for the product"),
    status: Joi.number().required().valid(2,3).example(1).description("Unique identifier for the product"),
    reason: Joi.when('status',{
        is: 3,
        then: Joi.string().required(),
        otherwise: Joi.string().optional().allow(null)
    }).example(1).description("Unique identifier for the product"),
}).label('product-identity').description('Identifier for product');

const copyGalleryIdentity: Joi.ObjectSchema = Joi.object().keys({
    productId: Joi.number().required().example(1).description("Unique identifier for the product for which gallery is to be updated"),
    toBeCopiedFromProductId: Joi.number().required().example(1).description("Unique identifier for the product from which gallery is to be copied"),
}).label('product-gallery-copy-identity').description('Identifier for copying product gallery');

export {
    productRequest,
    listProductRequest,
    productIdentity,
    copyGalleryIdentity,
    productApprovalRequest
}