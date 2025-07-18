import {Joi,Common,_} from "../config/routeImporter";
import {userObject,categoryObject,parenetCategory,categoryTypeObject,attachmentObject} from "./relations";
let subject="Invitation to join community"
let description="Content of email with link {{{invitation_link}}}"

const invitation: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().integer().description("Unique identifier for the invitation").example(1),
    subject: Joi.string().description("Subject of invitation to be sent").example(subject),
    description:Joi.string().trim().description('Content of email for the invitation user keyword {{{invitation_link}}} to place link in the content').example(description),
    createdBy:userObject,
    updatedBy:userObject,
    invitedMembers:Joi.array().items(Joi.string().email().description('Email of the user to be invited')).description("Files attached to the news"),
    createdAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Creation date"),
    updatedAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Last update date"),
}).label('member-invitation').description('News object')

const invitationRequest: Joi.ObjectSchema = Joi.object().keys({
    subject: Joi.string().description("Subject of invitation to be sent").example(subject).required().error(errors => { return Common.routeError(errors, 'INVITATION_SUBJECT_IS_REQUIRED') }),
    description: Joi.string().trim().description('Content of email for the invitation user keyword {{{invitation_link}}} to place link in the content').example(description).required().error(errors => { return Common.routeError(errors, 'INVITATION_DESCRIPTION_IS_REQUIRED') }),
    invitedMembers: Joi.array().items(Joi.string().email().description('Email of the user to be invited')).required().error(errors => { return Common.routeError(errors, 'INVITED_MEMBERS_IS_REQUIRED') }).description("Members to be invited").example(["email@domai.com","email1@domain.com"]),
}).label('invitation-request').description('Request object for the invitation')

export {
    invitation,
    invitationRequest
}