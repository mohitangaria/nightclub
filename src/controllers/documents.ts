import { Models, sequelize } from "../models";
import { Sequelize, Op } from "../config/dbImporter";
import * as Common from "./common";
import * as Constants from "../constants";
import * as Hapi from "@hapi/hapi";
import { WhereOptions } from 'sequelize';
import { AttributeElement } from "../config/customTypes";
import * as Fs from 'fs';
import * as uuid from 'uuid';
import { UserDocumentInterface } from "../config/interfaces/document";
import { _ } from "../config/routeImporter";
import { AgreementInterface } from "../config/interfaces/document";
import * as handlebars from 'handlebars';
import { generateToken } from "./users";
import puppeteer from "puppeteer";
// import moment from "moment";
import moment from "moment-timezone"
import { sendEmail } from "./email";

const documentAttributes: AttributeElement[] = ["id", "documentId", "userId", "attachmentId", "agreement", "isSigned", "signAttachmentId","lastUpdatedBy", "isRevision", "revisionId", "status", [sequelize.fn('CONCAT', process.env.BASE_URL, "/attachment/", sequelize.literal('`attachment`.`unique_name`')), 'filePath']];

const createFolderIfNotExists = (createDirectory: boolean): string => {
    const dt = new Date();
    const folder = dt.getUTCFullYear() + "/" + dt.getUTCMonth() + "/" + dt.getUTCDate() + '/';
    const targetDir = 'resources/agreements/' + folder;
    if (createDirectory)
        Fs.mkdirSync(targetDir, { recursive: true });
    return targetDir;
}

const storeRevision = async (Object: UserDocumentInterface, transaction: Sequelize.Transaction) => {
    try {
        let revisonObject = JSON.parse(JSON.stringify(Object));
        let revisionId = revisonObject.id;
        revisonObject = _.omit(revisonObject, ['id']);
        revisonObject.isRevision = true;
        revisonObject.status = 0;
        
        revisonObject.revisionId = revisionId;
        
        let revision = await Models.UserDocument.create(revisonObject, { transaction: transaction });
        if (revision)
            return revision;
        else
            return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}

// const generatePdfFromUrl = async(documentId: number, userId: number) => {
//     try {
//         const encodedDocumentId = Buffer.from((documentId).toString()).toString('base64');
//         let options = { format: 'A4' };
//         let file = { url: `${process.env.FRONTEND_DOMAIN}/user/agreement/${encodedDocumentId}` };
//         console.log(file, " ============ file")
//         const bufferResponse = await html_to_pdf.generatePdf(file, options);
//         const filePath = createFolderIfNotExists(true);
//         const name = uuid.v1() + ".pdf";
//         const filename = `agreement_user_${userId}.pdf`;
//         Fs.writeFileSync(filePath+name, bufferResponse);
//         const attachment = await Models.Attachment.create({ 
//             fileName: filename, userId: userId, accountId: userId, uniqueName: name,
//             extension: ".pdf", filePath: filePath+name, type: 1, size: 0, status: 1 
//         });

//         await Models.UserDocument.update({ attachmentId: attachment.id }, { where: { id: documentId } })
//         return { success: true, message: "REQUEST_SUCCESSFULL", data: null }
//     } catch (error) {
//         console.log(error)
//         return { success: false, message: "ERROR_WHILE_GENERATING_PDF", data: null }
//     }
// }

const generatePdfFromUrl = async(documentId: number, userId: number) => {
    try {
        const encodedDocumentId = Buffer.from((documentId).toString()).toString('base64');

        // const url = `http://35.160.88.219:3010/user/agreement/NDE=`;
        const url = `${process.env.FRONTEND_DOMAIN}/user/agreement/${encodedDocumentId}/${moment().utc().toISOString()}`;

        console.log(url, " =========== url")

        const filePath = createFolderIfNotExists(true);
        const name = uuid.v1() + ".pdf";
        const filename = `agreement_user_${userId}.pdf`;

        const browser = await puppeteer.launch({
            headless: true
          });
        const context = browser.defaultBrowserContext();
        const page = await context.newPage();
        await page.setCacheEnabled(false);
        
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.goto(url, { waitUntil: 'networkidle2' });

        const pageContent = await page.content();
        console.log(pageContent, " =============== pageContent")

        await page.pdf({ path: filePath + name, margin: { top: 30, bottom: 30, left: 30, right: 30 } });
        await browser.close();
        const attachment = await Models.Attachment.create({
            fileName: filename, userId: userId, accountId: userId, uniqueName: name,
            extension: "pdf", filePath: filePath+name, type: 1, size: 0, status: 1 
        });
        await Models.UserDocument.update({ attachmentId: attachment.id }, { where: { id: documentId } })
        return { success: true, message: "REQUEST_SUCCESSFULL", data: null }
    } catch (error) {
        console.log(error)
        return { success: false, message: "ERROR_WHILE_GENERATING_PDF", data: null }
    }
}

function replaceAll(str: string, search: string, replacement: string): string {
    return str.split(search).join(replacement);
}

export const generateDocumentHtmlPage = async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        const language = request.headers.language || process.env.DEFAULT_LANGUAGE_CODE;
        const slug = request.params.slug;

        const decodedDocumentId = Buffer.from(slug, 'base64').toString('utf8');

        let documentId = Number(decodedDocumentId);

        const userDocument = await Models.UserDocument.findOne({ where: { id: documentId } });
        if(!userDocument) {
            return Common.generateError(request, 400, 'INVALID_DOCUMENT', {});
        }

        const SellerDetails = await Models.UserProfile.findOne({ where: { userId: userDocument.userId } });

        let content = userDocument.linkedHtml;
        content = replaceAll(content!,"&lt;Stylette&gt;","Stylette");
        content = replaceAll(content!,"&lt;Sheena&gt;","Sheena");
        const agreement: any = userDocument.agreement!;

        agreement["companySignature"] = new handlebars.SafeString(`<img src="${process.env.SHEENA_SIGNATURE_PATH}" alt="Seller Signature">`)
        agreement["companyPersonName"] = "Sheena Jongeneel"

        if(userDocument.docSignedDate) {
            agreement["docSignedDate"] = moment(userDocument.docSignedDate).utc().format('MMM DD, YYYY HH:mm:ss');
            agreement["vendorName"] = SellerDetails?.name;
        } else {
            agreement["docSignedDate"] = "________________________________";
            agreement["vendorName"] = "________________________________";
        }
        if(userDocument.docCreatedDate) {
            agreement["docCreatedDate"] = moment(userDocument.docCreatedDate).utc().format('MMM DD, YYYY HH:mm:ss');
        } else {
            agreement["docCreatedDate"] = "________________________________";
        }

        let sellerSignaturePath = null;
        if(userDocument.signAttachmentId) {
            const attachmentInfo = await Models.Attachment.findOne({ where: { id: userDocument.signAttachmentId } });
            if(attachmentInfo) {
                sellerSignaturePath = process.env.BASE_URL + '/attachment/' + attachmentInfo.uniqueName;
                // sellerSignaturePath = process.env.PROTOCOL + '://' + process.env.API_SERVER_HOST + '/attachment/' + attachmentInfo.uniqueName;
            }
        }


        if(sellerSignaturePath) {
            agreement["sellerSignature"] = new handlebars.SafeString(`<img src="${sellerSignaturePath}" alt="Seller Signature">`);
        } else {
            agreement["sellerSignature"] = "________________________________";
        }

        let templateToSend = handlebars.compile(content);
        let htmlToSend = templateToSend(agreement);
        
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFUL"), responseData: { html: htmlToSend } }).code(200);
    } catch (error) {
        console.log(error)
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const generateDocument = async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const authId = request.auth.credentials.userData.id;
        // const name = request.auth.credentials.userData.name;
        const userId = request.payload.userId;
        const language = request.headers.language;
        const agreement = request.payload;
        const timezone = request.headers.timezone;

        let formattedDate = moment(new Date()).tz(timezone).format('MMM DD, YYYY HH:mm:ss');

        const sellerProfileInfo = await Models.SellerProfile.findOne({ where: { userId } });
        if(!sellerProfileInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_SELLER_PROFILE', {});
        }

        // const sellerFields = await Models.ShopRequest.findOne({ where: { userId } });
        // if(!sellerFields) {
        //     await transaction.rollback();
        //     return Common.generateError(request, 400, 'SELLER_DETAILS_PENDING', {});
        // }

        const replacements = {...agreement}
        // const replacements = {...agreement, ...sellerFields.requestObject}

        let fetchRawDocument = await Models.Document.findOne({
            include: [
                {
                    model: Models.DocumentContent, as: "content",
                    include:[
                        {attributes:[],model:Models.Language, where:{code:language}}
                    ]
                },
                {
                    required: true,
                    model: Models.DocumentContent, as: "defaultContent",
                    include:[
                        {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUAGE_CODE}}
                    ]
                }
            ]
        });


        if(!fetchRawDocument) {
            await transaction.rollback();
            return Common.generateError(request,400,'DOCUMENT_NOT_FOUND',{});
        }

        fetchRawDocument = JSON.parse(JSON.stringify(fetchRawDocument));
        const content = fetchRawDocument?.content ? fetchRawDocument?.content?.description : fetchRawDocument?.defaultContent?.description;

        let documentId = null;
        const userDocExists = await Models.UserDocument.findOne({ where: { isRevision: false, userId } });
        if(userDocExists) {
            await storeRevision(userDocExists, transaction);
            await userDocExists.update({ 
                attachmentId: null, agreement: replacements, lastUpdatedBy: authId, docCreatedDate: formattedDate,
                accountId: null,linkedHtml: content,isSigned: false, signAttachmentId: null, docSignedDate:  null
            }, { transaction });

            documentId = userDocExists.id;
        } else {
            const createdDoc = await Models.UserDocument.create({ 
                documentId: fetchRawDocument?.id, userId: userId, attachmentId: null,
                agreement: replacements, lastUpdatedBy: authId, accountId: null, linkedHtml: content, 
                isSigned: false, docCreatedDate: formattedDate
            }, { transaction });

            documentId = createdDoc.id;
        }

        await sellerProfileInfo.update({ currentStatus: Constants.SELLER_STATUS.DOCUMENT_GENERATED }, { transaction });

        await transaction.commit();

        await generatePdfFromUrl(documentId!, userId);
        
        const docInfo = await Models.UserDocument.findOne({
            where: {id: documentId},
            attributes: documentAttributes,
            include: [
                {
                    model: Models.Attachment, as: "attachment",
                    attributes: []
                }
            ]
        });

        {
            const userInfo = await Models.User.findOne({ where: { id: userId  }, include: [{ model: Models.UserProfile, as: "userProfile" }] });
            if(userInfo) {
                let emailReplacements = { name: userInfo.userProfile?.name, link: process.env.SELLER_DOMAIN }
                await sendEmail("doc_received_for_signature", emailReplacements, [userInfo.email], request.headers.language);
            }
        }


        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFUL"), responseData: docInfo }).code(200);
    } catch (error) {
        console.log(error)
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const reGenerateDocument = async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const authId = request.auth.credentials.userData.id;
        const userId = request.params.id;
        // const timezone = request.headers.timezone;

        //let formattedDate = moment(new Date()).tz(timezone).format('MMM DD, YYYY HH:mm:ss');

        const userDocExists = await Models.UserDocument.findOne({ where: { userId: userId, isRevision: false } });
        if(!userDocExists) {
            await transaction.rollback();
            return Common.generateError(request,400,'INVALID_DOCUMENT_ID_PROVIDED',{});
        }

        const sellerProfileInfo = await Models.SellerProfile.findOne({ where: { userId: userDocExists.userId } });
        if(!sellerProfileInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_SELLER_PROFILE', {});
        }
        
        await storeRevision(userDocExists, transaction);
        await userDocExists.update({ 
            attachmentId: null, lastUpdatedBy: authId,
            accountId: null,isSigned: false, signAttachmentId: null, docSignedDate:  null
        }, { transaction });

        await sellerProfileInfo.update({ currentStatus: Constants.SELLER_STATUS.DOCUMENT_REGENERATED }, { transaction });

        await transaction.commit();

        await generatePdfFromUrl(userDocExists.id!, userDocExists.userId!);
        
        const docInfo = await Models.UserDocument.findOne({
            where: {id: userDocExists.id},
            attributes: documentAttributes,
            include: [
                {
                    model: Models.Attachment, as: "attachment",
                    attributes: []
                }
            ]
        })

        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFUL"), responseData: docInfo }).code(200);
    } catch (error) {
        console.log(error)
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const getDocuments = async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        const authId = request.auth.credentials.userData.id;
        const isRevision = request.query.isRevision;
        let userId = request.params.id;
        if(userId === null || userId == undefined) {
            userId = authId;
        }

        let where: WhereOptions = { userId };
        if(isRevision !== null) where = { ...where, isRevision };

        const userDocuments = await Models.UserDocument.findAll({
            where: where,
            order: [["isRevision", "asc"],["id",  "desc"]],
            attributes: documentAttributes,
            include: [
                {
                    model: Models.Attachment, as: "attachment",
                    attributes: []
                }
            ]
        })

        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFUL"), responseData: userDocuments }).code(200);
    } catch (error) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const signDocument = async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const userId = request.auth.credentials.userData.id;
        const email = request.auth.credentials.userData.email;
        const name= request.auth.credentials.userData.name;
        const attachmentId = request.payload.attachmentId;
        const documentId = request.payload.documentId;

        const userDocument = await Models.UserDocument.findOne({ where: { id: documentId } });
        if(!userDocument) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_DOCUMENT_ID_PROVIDED', {});
        }

        if(userDocument.status !== Constants.STATUS.ACTIVE) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_DOCUMENT_ID_PROVIDED', {});
        }

        const attachmentInfo = await Models.Attachment.findOne({ where: { id: attachmentId } });
        if(!attachmentInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_ATTACHMENT_ID_PROVIDED', {});
        }
        // await storeRevision(userDocument, transaction);
        // await userDocument.update({ isSigned: true, signAttachmentId: attachmentId }, { transaction });

        // send otp
        const tokenData = await generateToken({signAttachmentId: attachmentId, documentId, email}, Constants.TOKEN_TYPES.AGREEMENT, transaction)
        if (tokenData.success !== true) {
            await transaction.rollback();
            return Common.generateError(request, 400, tokenData.message, {});
        }
        await transaction.commit();

        const replacements = { name: name, code: tokenData.data!.code };
        await sendEmail("submit_agreement", replacements, [email], request.headers.language);

        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFUL"), responseData: {token: tokenData.data!.token} }).code(200);
    } catch (error) {
        console.log(error)
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}


export const verifySignDocument = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const { token, code } = request.payload;
        const timezone = request.headers.timezone;
        // Find the token information in the database
        const tokenInfo = await Models.Token.findOne({ where: { token: token, code: code, status: Constants.STATUS.ACTIVE } });
        if (!tokenInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_TOKEN_PROVIDED', {});
        }

        // Validate and decode the token to get token data
        const tokenData = await Common.validateToken(Common.decodeToken(token), tokenInfo.type);
        if (!tokenData || !tokenData.credentials) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_TOKEN_PROVIDED', {});
        }

        const email = tokenData.credentials?.userData.email;
        const documentId = tokenData.credentials?.userData.documentId;
        const signAttachmentId = tokenData.credentials?.userData.signAttachmentId;

        const userExists = await Models.User.findOne({ where: { email: email } });
        if(!userExists) {
            await transaction.rollback();
            return Common.generateError(request, 400, "INVALID_USER", {});
        }

        const userId = userExists.id;

        const userDocument = await Models.UserDocument.findOne({ where: { id: documentId } });
        if(!userDocument) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_DOCUMENT_ID_PROVIDED', {});
        }

        if(userDocument.status !== Constants.STATUS.ACTIVE) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_DOCUMENT_ID_PROVIDED', {});
        }

        const attachmentInfo = await Models.Attachment.findOne({ where: { id: signAttachmentId } });
        if(!attachmentInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_ATTACHMENT_ID_PROVIDED', {});
        }
        // const formattedDate = moment(new Date()).utc().format('MMM DD, YYYY HH:mm:ss');
        let formattedDate = moment(new Date()).tz(timezone).format('MMM DD, YYYY HH:mm:ss');
        console.log(formattedDate)
        await storeRevision(userDocument, transaction);
        await userDocument.update({ isSigned: true, signAttachmentId: signAttachmentId, docSignedDate: formattedDate }, { transaction });
        await tokenInfo.update({ status: 0 }, { transaction });
        await Models.SellerProfile.update({ currentStatus: Constants.SELLER_STATUS.DOCUMENT_SIGNED }, { where:{ userId }, transaction });

        await transaction.commit();
        await generatePdfFromUrl(documentId!, userId!);
        const docInfo = await Models.UserDocument.findOne({
            where: {id: documentId},
            attributes: documentAttributes,
            include: [
                {
                    model: Models.Attachment, as: "attachment",
                    attributes: []
                }
            ]
        });
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: docInfo }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}
