import {Joi,Common,_} from "../config/routeImporter"

const attachmentObject :  Joi.ObjectSchema = Joi.object().keys({
    id:Joi.number().example(1).description("Unique identifier of the file"),
    fileName:Joi.string().example('attachment-name').description("file name"),
    extension:Joi.string().example('.png').description("extension of the file").allow(null),
    size:Joi.number().example(1024).description("Size of the file").allow(null),
    filePath:Joi.string().example('attachment-path').description("Http path to the file"),
    isEncrypted:Joi.number().allow(null).default(1).description("If the file is encrypted or not")
}).label('attachment-summary').description("Summary of the attachment associated with the entity")

const categoryTypeObject :  Joi.ObjectSchema = Joi.object().keys({
    id:Joi.number().example(1).description("Unique identifier of the category type"),
    code:Joi.string().example('category-code').description("Code of the category type"),
    name:Joi.string().example("Name of the category type").description("Name of the category type")
}).label('category-type-summary').description("Summary of the category type associated with the entity")

const directoryObject :  Joi.ObjectSchema = Joi.object().keys({
    id:Joi.number().example(1).description("Unique identifier of the category"),
    code:Joi.string().example('category-code').description("Code of the category"),
    isGlobal:Joi.number().example(1).description("If category is global"),
    name:Joi.string().example("Name of the category").description("Name of the category"),
    size:Joi.number().example(100).allow(null).description("Size of files in first level"),
    fileCount:Joi.number().example(4).description("Number of child files at first level"),
    directoryCount:Joi.number().example(4).description("Number of child directories at first level"),
    totalFilesCount:Joi.number().example(4).description("Number of child directories at all levels"),
    totalDirecoryCount:Joi.number().example(4).description("Number of child files at all levels"),
    totalFilesSize:Joi.number().example(100).allow(null).description("Size of files in all child level"),
    createdAt:Joi.date().example("2023-01-02T12:18:55.000Z").description("Creation date"),
    userSignupDate:Joi.date().example("2023-01-02T12:18:55.000Z").description("Used when default directory is created by system").allow(null),
    categoryImage:attachmentObject.allow(null)
}).label('directory-summary').description("Summary of the directory")


const parenetCategory :  Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().example(1).description("Category identifier"),
    code: Joi.string().example("code").description("Category code"),
    name: Joi.string().example("category name").description("Category name"),
    parentId: Joi.number().allow(null).example(1).description("Category parent id"),
}).label('category-parent-summary').description("Object for category parent");


const categoryObject :  Joi.ObjectSchema = Joi.object().keys({
    id:Joi.number().example(1).description("Unique identifier of the category"),
    code:Joi.string().example('category-code').description("Code of the category"),
    name:Joi.string().example("Name of the category").description("Name of the category"),
    categoryImage:attachmentObject.allow(null)
}).label('category-summary').description("Summary of the category associated with the entity")

const userObject :  Joi.ObjectSchema = Joi.object().keys({
    id:Joi.number().example(1).description("Unique identifier of the user"),
    name:Joi.string().example("Name of the user").description("Complete name of the user"),
    email:Joi.string().example("email@domain.com").description("Email id of the user"),
    countryCode:Joi.string().example("+91").description("Country code").allow(null),
    mobile:Joi.string().example("999999999").description("Mobile number of the user").allow(null),
    profileImage:Joi.string().example("User's profile image").description("User's profile image").allow(null),
    status:Joi.number().example(1).description("Account status").allow(null),
}).label('user-summary').description("Summary of user associated with the entity")


const permissionObject :  Joi.ObjectSchema = Joi.object().keys({
    id:Joi.number().example(1).description("Unique identifier of the permission"),
    name:Joi.string().example("Name of the permission").description("Complete name of the permission"),
    description:Joi.string().example("Description of the permission").description("Description of the permission")
}).label('permission-summary').description("Summary of permissions associated with the entity")

export{
    categoryObject,
    categoryTypeObject,
    directoryObject,
    parenetCategory,
    userObject,
    permissionObject,
    attachmentObject
}