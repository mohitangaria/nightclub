import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
// import * as Models from '../models';
import Hapi from "@hapi/hapi"
import * as Common from './common';
import * as Constants from '../constants';
import * as Moment from 'moment';
import * as _ from 'lodash';
import { Sequelize, Op } from '../config/dbImporter';
import * as Path from 'path';
import * as Fs from 'fs';
import { Readable } from 'stream';
import * as extensions from '../config/extensions';
import sharp from 'sharp';
import * as crypto from 'crypto-js';
import { object } from 'joi';
import Attachment from '../models/Attachment';
import { Models } from '../models';
import { Response } from 'aws-sdk';
import { Stream } from "stream";

interface fileOptions {
    dest: string,
    userId: number;
    accountId?: number;
}

const attributes: string[] = ['id', 'filePath', 'uniqueName', 'fileName', 'extension', 'type'];

/** Create directory structure */
// const createFolderIfNotExists = (createDirectory: boolean): string => {
//     const dt = new Date();
//     const folder = dt.getUTCFullYear() + "/" + dt.getUTCMonth() + "/" + dt.getUTCDate() + '/';
//     const targetDir = 'resources/attachments/' + folder;
//     if (createDirectory)
//         Fs.mkdirSync(targetDir, { recursive: true }, 0o777);
//     return targetDir;
// }


const createFolderIfNotExists = (createDirectory: boolean): string => {
    const dt = new Date();
    const folder = `${dt.getUTCFullYear()}/${dt.getUTCMonth() + 1}/${dt.getUTCDate()}/`;
    const targetDir = Path.join('resources', 'attachments', folder);

    if (createDirectory) {
        Fs.mkdirSync(targetDir, { recursive: true, mode: 0o777 });
    }

    return targetDir;
};

/** Check file is array or object and call respective functions */
const uploader = (files: Stream, options: fileOptions) => {
    return fileHandler(files, options);
}

// /** Function to upload multiple files */
// const filesHandler = (files: any[], options: any) => {
//     const promises = files.map(x => fileHandler(x, options));
//     return Promise.all(promises);
// }

/** unlink file from path */
// const unlinkFile = (path: string) => {
//     Fs.unlink(path, (err: string) => {
//         if (err) {
//             console.error(err)
//             return
//         }
//     })
// }

const unlinkFile = (path: string) => {
    Fs.unlink(path, (err: any) => {
        if (err) {
            console.error(`Failed to delete file at ${path}:`, err);
        } else {
            console.log(`File deleted at ${path}`);
        }
    });
};

const encryptAES = (key: any, message: string): string => {
    var iv = crypto.enc.Hex.parse(process.env.IV);
    var ciphertext = crypto.AES.encrypt(message, key.toString(), { iv: iv, mode: crypto.mode.ECB, padding: crypto.pad.NoPadding }).toString();
    return ciphertext;
}

const decryptAES = (key: any, message: string): string => {
    var iv = crypto.enc.Hex.parse(process.env.IV);
    var text = crypto.AES.decrypt(message, key.toString(), { iv: iv, mode: crypto.mode.ECB, padding: crypto.pad.NoPadding }).toString(crypto.enc.Utf8);
    return text;
}

/** Function to upload single file */
const fileHandler = async (file: Hapi.RequestQuery, options: fileOptions): Promise<any> => {
    try {
        const extension = Path.extname(file.hapi.filename);
        const name = uuid.v1() + extension;
        const Resizedname = 'thumb_' + name;
        const destinationPath = `${options.dest}${name}`;
        const destinationPathResized = `${options.dest}${Resizedname}`;
        const fileStream = await Fs.createWriteStream(destinationPath);
        let imageFileExtensions = ['.jpeg', '.png', '.jpg', '.svg'];
        return new Promise((resolve, reject) => {
            file.on('error', (err: string) => {
                reject(err);
            });
            file.pipe(fileStream);
            file.on('end', async () => {
                setTimeout(async () => {
                    if (imageFileExtensions.includes(extension.toLowerCase())) {
                        let imageMeta = await sharp(destinationPath).metadata();
                        if (imageMeta.width != undefined && imageMeta.width > 800 || imageMeta.height != undefined && imageMeta.height > 800) {
                            if (extension == '.png') {
                                sharp(destinationPath).resize({ fit: sharp.fit.inside, width: 800, height: 800 }).png({ compressionLevel: 9, quality: 90 }).toFile(destinationPathResized).then(() => {
                                    Fs.unlink(destinationPath, (() => {
                                        Fs.rename(destinationPathResized, destinationPath, (() => { }));
                                    }));
                                });
                            } else {
                                sharp(destinationPath).resize({ fit: sharp.fit.inside, width: 800, height: 800 }).toFile(destinationPathResized).then(() => {
                                    Fs.unlink(destinationPath, (() => {
                                        Fs.rename(destinationPathResized, destinationPath, (() => { }));
                                    }));
                                });
                            }
                        }
                    }
                    const { size } = Fs.statSync(destinationPath);
                    const fileDetails = {
                        uniqueName: name,
                        fileName: file.hapi.filename,
                        extension: extension.replace('.', ''),
                        filePath: destinationPath,
                        size: size,
                        userId: options.userId,
                        status: Constants.STATUS.INACTIVE,
                        accountId: options.accountId
                    }
                    resolve(fileDetails);
                }, 100);
            });
        });
    } catch (err) {
        return {}
    }
}

export const createS3Attachment = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let userId = null;
        let accountId = null;
        let dataKey = null;
        let extension;
        let uniqueName = null;
        if (request.auth.isAuthenticated) {
            userId = request.auth.credentials.userData.id;
            accountId = request.auth.credentials.userData.accountId;
            dataKey = request.auth.credentials.userData.dataKey;
            extension = request.auth.credentials.userData.extension;
            uniqueName = request.auth.credentials.userData.uniqueName;
        }
        let { key, fileName } = request.payload;
        const bucketName = process.env.S3_BUCKET_NAME;
        const s3 = new AWS.S3()
        var params: AWS.S3.GetObjectRequest = {
            Bucket: `${bucketName}`,
            Key: key
        }
        var object = await s3.getObject(params).promise();
        if (object.ContentLength) {
            let keyParts = key.split('/');
            let uniqueName = keyParts.at(-1);


            let attachment = await Models.Attachment.create({
                userId: userId,
                accountId: accountId,
                fileName: fileName,
                filePath: key,
                size: object.ContentLength,
                type: Constants.ATTACHMENT_TYPE.S3_BUCKET,
                status: Constants.STATUS.INACTIVE,
                uniqueName: uniqueName,
                dataKey: dataKey,
                extension: extension
            });
            if (attachment) {
                return h.response({
                    message: request.i18n.__("FILE_UPLOADED_SUCCESSFULLY"),
                    responseData: attachment
                }).code(200)
            } else {
                return Common.generateError(request, 400, 'ERROR_WHILE_STORING_FILE_DATA', {});
            }
        } else {
            return Common.generateError(request, 404, 'FILE_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// export const gets3SignedUrl = async (request: any, h: any) => {
//     try {
//         let userId = null;
//         let accountId = null;
//         if (request.auth.isAuthenticated) {
//             userId = request.auth.credentials.userData.id;
//             accountId = request.auth.credentials.userData.accountId;
//         }
//         const { fileName, encryptDataFlag, fileSize } = request.query;
//         const extension = Path.extname(fileName);
//         const uniqueName = uuid.v1() + extension;
//         const s3 = new AWS.S3()
//         const dt = new Date();
//         const folder = dt.getUTCFullYear() + "/" + dt.getUTCMonth() + "/" + dt.getUTCDate() + '/';
//         const filePath = process.env.S3_KEY_PREFIX + folder + uniqueName;
//         const myBucket = process.env.S3_BUCKET_NAME;
//         const myKey = filePath;
//         const signedUrlExpireSeconds = +process.env.S3_URL_EXPIRATION_TIME;
//         let checkPrerequisites = await Common.checkPrerequisites(userId, accountId, fileSize);
//         if (!checkPrerequisites) {
//             return Common.generateError(request, 400, 'STORAGE_LIMIT_EXCEEDS', {});
//         }
//         const url = await s3.getSignedUrl('putObject', {
//             Bucket: myBucket,
//             Key: myKey,
//             Expires: signedUrlExpireSeconds
//         })
//         if (encryptDataFlag) {
//             const cmk = new AWS.KMS();
//             const params = {
//                 KeyId: process.env.CMK_KEY_ID, // AWS KMS ID
//                 KeySpec: process.env.CMK_KEY_SPEC // Specifies the type of data key to return.
//             };
//             let dataKey = await cmk.generateDataKey(params).promise();
//             if (dataKey) {
//                 const params = {
//                     CiphertextBlob: dataKey.CiphertextBlob
//                 };
//                 let regen = await cmk.decrypt(params).promise();
//                 let attachment = await Models.Attachment.create({
//                     userId: userId,
//                     accountId: accountId,
//                     uniqueName: uniqueName,
//                     fileName: fileName,
//                     extension: extension.trim(),
//                     filePath: filePath,
//                     size: 0,
//                     status: Constants.STATUS.INACTIVE,
//                     type: Constants.ATTACHMENT_TYPE.S3_BUCKET,
//                     dataKey: dataKey.CiphertextBlob.toString('base64')
//                 })
//                 return h.response({
//                     message: request.i18n.__("SIGNED_URL_CREATED_SUCCESSFULLY"),
//                     responseData: {
//                         id: attachment.id,
//                         signedUrl: url,
//                         fileName: fileName,
//                         uniqueName: uniqueName,
//                         dataKey: {
//                             Plaintext: regen.Plaintext.toString('base64')
//                         }
//                     }
//                 }).code(200)
//             } else {
//                 return Common.generateError(request, 400, 'ERROR_WHILE_GENERATING_DATA_KEY', {});
//             }
//         } else {
//             return h.response({
//                 message: request.i18n.__("SIGNED_URL_CREATED_SUCCESSFULLY"),
//                 responseData: { signedUrl: url, fileName: fileName, uniqueName: uniqueName }
//             }).code(200)
//         }
//     } catch (err) {
//         return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
//     }
// }

// export const getDecryptionData = async (request: any, h: any) => {
//     try {
//         let userId = request.auth.credentials.userData.id;
//         let accountId = request.auth.credentials.userData.accountId;
//         let { uniqueName } = request.query;
//         let attachment = await Models.Attachment.findOne({
//             where: {
//                 uniqueName: uniqueName, [Op.or]: [
//                     { userId: null },// attachment is uploaded as public content
//                     { userId: userId }, // user is owner of the document
//                     {
//                         [Op.and]: [
//                             [Sequelize.where(Sequelize.col('`Document->nominees->sharedWithNominees`.`invitee_id`'), '=', userId)],
//                             [Sequelize.where(Sequelize.col('`Document`.`shared_with_nominee`'), '=', 1)]
//                         ]
//                     },
//                     {
//                         [Op.and]: [
//                             [Sequelize.where(Sequelize.col('`Document->author->userNominees`.`invitee_id`'), '=', userId)],
//                             [Sequelize.where(Sequelize.col('`Document`.`shared_with_universal_nominee`'), '=', 1)]
//                         ]
//                     }
//                 ]
//             },
//             include: [
//                 {
//                     model: Models.Document,
//                     include: [
//                         {
//                             model: Models.DocumentSharing, as: 'nominees',
//                             include: [
//                                 { model: Models.Nominee, as: 'sharedWithNominees' }
//                             ]
//                         },
//                         {
//                             model: Models.User, as: 'author',
//                             include: [
//                                 {
//                                     model: Models.Nominee, as: 'userNominees',
//                                     where: { isUniversalNominee: 1 }
//                                 }
//                             ]
//                         }
//                     ]
//                 },
//             ],
//             subQuery: false
//         });
//         if (attachment) {
//             const cmk = new AWS.KMS();
//             const s3 = new AWS.S3()
//             const signedUrlExpireSeconds = +process.env.S3_URL_EXPIRATION_TIME;
//             const params = {
//                 CiphertextBlob: Buffer.from(attachment.dataKey, "base64")
//             };
//             let regen = await cmk.decrypt(params).promise();
//             const myBucket = process.env.S3_BUCKET_NAME;
//             const url = await s3.getSignedUrl('getObject', {
//                 Bucket: myBucket,
//                 Key: attachment.filePath,
//                 Expires: signedUrlExpireSeconds
//             })
//             return h.response({
//                 message: request.i18n.__("SIGNED_URL_CREATED_SUCCESSFULLY"),
//                 responseData: {
//                     id: attachment.id,
//                     signedUrl: url,
//                     fileName: attachment.fileName,
//                     uniqueName: uniqueName,
//                     dataKey: {
//                         Plaintext: regen.Plaintext.toString('base64')
//                     }
//                 }
//             }).code(200)
//         } else {
//             return Common.generateError(request, 400, 'FILE_NOT_FOUND', {});
//         }
//     } catch (err) {
//         return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
//     }
// }

export const verifyS3Upload = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let key = request.query.key;
        const bucketName = process.env.S3_BUCKET_NAME;
        const s3 = new AWS.S3();

        var params: AWS.S3.GetObjectRequest = {
            Bucket: `${bucketName}`,
            Key: key,
        };

        var object = await s3.getObject(params).promise();

        if (object.ContentLength !== undefined) {
            return h.response({ message: request.i18n.__("FILE_EXISTS_IN_S3") }).code(200);
        } else {
            return Common.generateError(request, 404, 'FILE_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
};

// Upload file to server
export const upload = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let userId = null;
        let dataKey = null;
        let accountId = null;
        if (request.auth.isAuthenticated) {
            userId = request.auth.credentials.userData.id;
            accountId = request.auth.credentials.userData.accountId;
            dataKey = request.auth.credentials.userData.dataKey as Text;

        }
        if (request.payload && request.payload['file']) {
            if (process.env.USE_FILE_SYSTEM) {
                const extension = Path.extname(request.payload.file.hapi.filename);
                const filePath = createFolderIfNotExists(true);
                const uploadInfo = {
                    dest: filePath,
                    userId: userId,
                    accountId: accountId
                }
                let fileDetails = await uploader(request.payload['file'], uploadInfo);
                if ((fileDetails && fileDetails.hasOwnProperty('uniqueName')) || (Array.isArray(fileDetails) && fileDetails && fileDetails.length)) {
                    fileDetails = Array.isArray(fileDetails) ? fileDetails : fileDetails;
                    let respData = await Models.Attachment.create(fileDetails);
                    respData = JSON.parse(JSON.stringify(respData));

                    delete respData.dataKey
                    // respData = _.omit(respData, dataKey);

                    respData['filePath'] = process.env.BASE_URL + '/attachment/' + respData.uniqueName
                    return h.response({
                        message: request.i18n.__("FILE_UPLOADED_SUCCESSFULLY"),
                        responseData: respData
                    }).code(200);
                } else {
                    return Common.generateError(request, 400, 'ERROR_WHILE_UPLOADING_FILE', {});
                }
            } else {
                const extension = Path.extname(request.payload.file.hapi.filename);
                const uniqueName = uuid.v1() + extension;
                const bucketName = process.env.S3_BUCKET_NAME;
                const fileName = createFolderIfNotExists(false);
                const fileContent = Buffer.from(request.payload.file._data, 'binary');
                const s3 = new AWS.S3()

                var params = {
                    Bucket: `${bucketName}`,
                    Key: process.env.S3_KEY_PREFIX + fileName + uniqueName,
                    Body: fileContent
                };
                // Uploading files to the bucket
                let uploadedFile = await s3.upload(params).promise();
                let filePath = process.env.S3_KEY_PREFIX + fileName + uniqueName;
                // if (uploadedFile.totalBytes) {
                if (true) {
                    const fileDetails = {
                        uniqueName: uniqueName,
                        fileName: request.payload.file.hapi.filename,
                        extension: extension.replace('.', ''),
                        filePath: process.env.S3_KEY_PREFIX + fileName + uniqueName,
                        size: 0,
                        userId: userId,
                        accountId: accountId,
                        status: Constants.STATUS.INACTIVE,
                        type: Constants.ATTACHMENT_TYPE.S3_BUCKET,
                        dataKey: dataKey
                    }
                    let responseData = await Models.Attachment.create(fileDetails);
                    responseData = JSON.parse(JSON.stringify(responseData));
                    responseData = _.omit(responseData, ['dataKey']);
                    responseData['filePath'] = process.env.BASE_URL + '/attachment/' + responseData.fileName;
                    return h.response({
                        responseData: responseData,
                        message: request.i18n.__("FILE_UPLOADED_SUCCESSFULLY")
                    }).code(200);
                } else {
                    return Common.generateError(request, 400, 'ERROR_WHILE_UPLOADING_FILE', {});
                }
            }
        } else {
            return Common.generateError(request, 400, 'ERROR_WHILE_UPLOADING_FILE', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// Delete uploaded file by unique name
export const deleteAttachment = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        const attachment = await Models.Attachment.findOne({ where: { uniqueName: request.params.uniqueName, [Op.or]: [{ userId: userId, accountId: accountId }] }, attributes: attributes });
        if (attachment) {
            unlinkFile(attachment.filePath);
            await Models.Attachment.destroy({ where: { id: attachment.id } });
            return h.response({ message: request.i18n.__("FILE_DELETED_SUCCESSFULLY"), responseData: attachment }).code(200);
        } else {
            return Common.generateError(request, 404, 'FILE_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// Download uploaded file by unique name
export const download = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        const attachment = await Models.Attachment.findOne({ where: { uniqueName: request.params.uniqueName }, attributes: attributes });
        if (attachment) {
            if (attachment.type == Constants.ATTACHMENT_TYPE.LOCAL) {
                const stream = Fs.createReadStream(attachment.filePath);
                const streamData = new Readable().wrap(stream);
                const contentType = extensions.getContentType(attachment.extension);
                console.log({streamData, contentType, filename: attachment.fileName});
                return h.response(streamData)
                    .header('Content-Type', contentType)
                    .header('Content-Disposition', 'attachment; filename=' + attachment.fileName);
            } else if (attachment.type == Constants.ATTACHMENT_TYPE.S3_BUCKET) {
                const bucketName = process.env.S3_BUCKET_NAME;
                const s3 = new AWS.S3()
                var params: AWS.S3.GetObjectRequest = {
                    Bucket: `${bucketName}`,
                    Key: `${attachment.filePath}`,
                };
                const contentType = extensions.getContentType(attachment.extension);
                var fileStream = await s3.getObject(params).createReadStream();
                return h.response(fileStream)
                    .header('Content-Type', contentType)
                    .header('Content-Disposition', 'attachment; filename=' + attachment.fileName);
            } else {
                return Common.generateError(request, 400, 'UNSUPPORTED_DOWNLOAD_OPTION', {});
            }
        } else {
            return Common.generateError(request, 404, 'FILE_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// View uploaded file by unique name
export const view = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        const attachment = await Models.Attachment.findOne({ where: { uniqueName: request.params.uniqueName }, attributes: attributes });
        if (attachment) {
            if (attachment.type == Constants.ATTACHMENT_TYPE.LOCAL) {
                const stream = Fs.createReadStream(attachment.filePath);
                const streamData = new Readable().wrap(stream);
                const contentType = extensions.getContentType(attachment.extension);
                if (!attachment.uniqueName.match(/.(jpg|jpeg|png|gif)$/i)) {
                    return h.response(streamData)
                        .header('Content-Type', contentType)
                        .header('Content-Disposition', 'attachment; filename=' + attachment.uniqueName);
                }
                return h.response(streamData)
                    .header('Content-Type', contentType)
            } else {
                const bucketName = process.env.S3_BUCKET_NAME;
                const s3 = new AWS.S3()
                var params: AWS.S3.GetObjectRequest = {
                    Bucket: `${bucketName}`,
                    Key: `${attachment.filePath}`,
                };
                const contentType = extensions.getContentType(attachment.extension);
                var fileStream = await s3.getObject(params).createReadStream();
                if (!attachment.uniqueName.match(/.(jpg|jpeg|png|gif)$/i)) {
                    return h.response(fileStream)
                        .header('Content-Type', contentType)
                        .header('Content-Disposition', 'attachment; filename=' + attachment.uniqueName);
                }
                return h.response(fileStream)
                    .header('Content-Type', contentType)
            }
        } else {
            return Common.generateError(request, 404, 'FILE_NOT_FOUND', Error);
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}


export const deleteAttachmentById = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        const attachment = await Models.Attachment.findOne({ where: { id: request.params.attachmentId, [Op.or]: [{ userId: userId, accountId: accountId }] }, attributes: attributes });
        if (attachment) {
            unlinkFile(attachment.filePath);
            await Models.Attachment.destroy({ where: { id: attachment.id } });
            return h.response({ message: request.i18n.__("FILE_DELETED_SUCCESSFULLY"), responseData: attachment }).code(200);
        } else {
            return Common.generateError(request, 404, 'FILE_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}