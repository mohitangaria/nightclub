import { Joi, Common, _ } from "../config/routeImporter";

const brandRequest: Joi.ObjectSchema = Joi.object().keys({
    name: Joi.string().trim().required().error(errors => { return Common.routeError(errors, 'BRAND_NAME_IS_REQUIRED') }).example("Gucci").description('It must be unique'),
    attachmentId: Joi.number().optional().example(101).description('Logo of the brand'),
}).label('brand-request').description('Payload object for creating a new brand');

const brandIdentity: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().required().example(1).description("Unique identifier for the brand"),
}).label('brand-identity').description('Identifier for brand');

const listBrandRequest: Joi.ObjectSchema = Joi.object().keys({
    searchText: Joi.string().trim(),
    page: Joi.number().optional().min(1).default(1),
    perPage: Joi.number().integer().optional().min(1).default(+process.env.PAGINATION_LIMIT!),
}).label('brand-list-request').description('Brand list request ');

const brandStatusRequest: Joi.ObjectSchema = Joi.object().keys({
    status: Joi.boolean().required().error(errors => { return Common.routeError(errors, 'BRAND_STATUS_IS_REQUIRED') }).valid(true, false).description("Status of the brand")
}).label('brand-status-request').description("Request to update the status of the brand")

export {
    brandRequest,
    brandIdentity,
    listBrandRequest,
    brandStatusRequest
}