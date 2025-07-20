import { Joi, Common, _ } from "../config/routeImporter";

const attributeOptions: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().example("12").description('Id of the attribute option'),
    isDeleted: Joi.boolean().example("true").description('If this attribute option needs to be deleted'),
    name: Joi.string().example("Option name").description('name of the option'),
}).label('attribute-option').description('Attribute option')

const attributeRequest: Joi.ObjectSchema = Joi.object().keys({
    name: Joi.string().trim().required().error(errors => { return Common.routeError(errors, 'ATTRIBUTE_NAME_IS_REQUIRED') }).example("Color").description('It must be unique for attributes'),
    type: Joi.number().example(1).description('1 => Text field, 2 => Dropdown field').optional().allow(null).default(null),
    isVariant: Joi.number().example(1).description("0 or 1, whether this is variant attribute or not").optional().allow(null).default(null),
    options: Joi.array().items(attributeOptions).min(0).label('options-listing').description('Array of options objects')
}).label('attribute-request').description('Payload object for creating a new attribute')


const attributeIdentity: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().required().example(1).description("Unique identifier for the attribute"),
}).label('attribute-identity').description('Identifier for attribute');

const listAttributeRequest: Joi.ObjectSchema = Joi.object().keys({
    page: Joi.number().optional().min(1).default(1),
    perPage: Joi.number().integer().optional().min(1).default(+process.env.PAGINATION_LIMIT!),
}).label('attributes-list-request').description('Attributes list request ')


const attributeStatusRequest: Joi.ObjectSchema = Joi.object().keys({
    status: Joi.boolean().required().error(errors => { return Common.routeError(errors, 'ATTRIBUTE_STATUS_IS_REQUIRED') }).valid(true, false).description("Status of the attribute")
}).label('attribute-status-request').description("Request to update the status of the attribute")

export {
    attributeRequest,
    attributeIdentity,
    listAttributeRequest,
    attributeStatusRequest
}