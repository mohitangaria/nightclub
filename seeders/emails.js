'use strict';

const { Models } = require("../dist/models");
const Constants = require("../dist/constants");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let initializations = await queryInterface.sequelize.query("select id from emails_templates", { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (initializations.length == 0) {
    //   let languages = await queryInterface.bulkInsert('languages', [
    //     { name: 'English', status: 1, code: 'en', is_default: true, created_at: new Date(), updated_at: new Date() }
    //   ])
    //   if (languages) {
    //     console.log("System language initialized successfully")
    //   }

        let userId = 1
        let defaultLanguage = 1;
    let emailTemplate = await Models.EmailTemplate.bulkCreate(
        [
            {
                code: "signup_verification",
                replacements: "name,code",
                userId: userId,
                accountId: userId,
                status: Constants.STATUS.ACTIVE,
                EmailTemplateContents: [{
                    title: "Signup Verification",
                    subject: "NightCode: Verify Your Account with This OTP",
                    message: `<td style="padding:32px 24px;border-bottom:1px solid #eaecf0"><h2 style="color:#101828;font-size:28px;font-style:normal;font-weight:600;line-height:128.571%">Hi {{name}},</h2><p style="padding:24px 0;color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%">Thank you for signing up for NightCode. To complete your registration, please use the following One-Time Password (OTP): {{code}}</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">Please do not share this OTP with anyone.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">If you did not request this email, please ignore it.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">Best regards,</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">NightCode Team</p></td>`,
                    messageText: `<td style="padding:32px 24px;border-bottom:1px solid #eaecf0"><h2 style="color:#101828;font-size:28px;font-style:normal;font-weight:600;line-height:128.571%">Hi {{name}},</h2><p style="padding:24px 0;color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%">Thank you for signing up for NightCode. To complete your registration, please use the following One-Time Password (OTP): {{code}}</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">Please do not share this OTP with anyone.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">If you did not request this email, please ignore it.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">Best regards,</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">NightCode Team</p></td>`,
                    languageId: defaultLanguage
                }]
            },
            {
                code: "welcome_onboard",
                replacements: "name",
                userId: userId,
                accountId: userId,
                status: Constants.STATUS.ACTIVE,
                EmailTemplateContents: [{
                    title: "Welcome Onboard",
                    subject: "Start Your Journey with NightCode",
                    message: `<td style="padding:32px 24px;border-bottom:1px solid #eaecf0"><h2 style="color:#101828;font-size:28px;font-style:normal;font-weight:600;line-height:128.571%">Hi {{name}},</h2><p style="padding:24px 0;color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%">Welcome to NightCode!</p><p style="padding:24px 0;color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%">We are thrilled to have you on board. Here at NightCode, we strive to provide the best experience possible, and we're excited for you to start exploring everything we have to offer.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">If you have any questions or need assistance, feel free to reach out to our support team. We're here to help!</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">Thank you for joining us, and we look forward to having you as part of our community.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">Best regards,</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">NightCode Team</p></td>`,
                    messageText: `<td style="padding:32px 24px;border-bottom:1px solid #eaecf0"><h2 style="color:#101828;font-size:28px;font-style:normal;font-weight:600;line-height:128.571%">Hi {{name}},</h2><p style="padding:24px 0;color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%">Welcome to NightCode!</p><p style="padding:24px 0;color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%">We are thrilled to have you on board. Here at NightCode, we strive to provide the best experience possible, and we're excited for you to start exploring everything we have to offer.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">If you have any questions or need assistance, feel free to reach out to our support team. We're here to help!</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">Thank you for joining us, and we look forward to having you as part of our community.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">Best regards,</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">NightCode Team</p></td>`,
                    languageId: defaultLanguage
                }]
            },
            {
                code: "reset_password",
                replacements: "name,code",
                userId: userId,
                accountId: userId,
                status: Constants.STATUS.ACTIVE,
                EmailTemplateContents: [{
                    title: "Reset Password",
                    subject: "Start Your Journey with NightCode",
                    message: `<td style="padding:32px 24px;border-bottom:1px solid #eaecf0"><h2 style="color:#101828;font-size:28px;font-style:normal;font-weight:600;line-height:128.571%">Hi {{name}},</h2><p style="padding:24px 0;color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%">We received a request to reset your password for your NightCode account. To reset your password, please use the following One-Time Password (OTP): {{code}}</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">Please enter it on the password reset page to proceed.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">If you did not request a password reset, please ignore this email. Your account remains secure.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">Best regards,</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">NightCode Team</p></td>`,
                    messageText: `<td style="padding:32px 24px;border-bottom:1px solid #eaecf0"><h2 style="color:#101828;font-size:28px;font-style:normal;font-weight:600;line-height:128.571%">Hi {{name}},</h2><p style="padding:24px 0;color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%">We received a request to reset your password for your [Your Application Name] account. To reset your password, please use the following One-Time Password (OTP): {{code}}</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">Please enter it on the password reset page to proceed.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">If you did not request a password reset, please ignore this email. Your account remains secure.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">Best regards,</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">NightCode Team</p></td>`,
                    languageId: defaultLanguage
                }]
            },
            {
                code: "change_email",
                replacements: "name,code",
                userId: userId,
                accountId: userId,
                status: Constants.STATUS.ACTIVE,
                EmailTemplateContents: [{
                    title: "Change Email",
                    subject: "Verify Your New Email Address for NightCode",
                    message: `<td style="padding:32px 24px;border-bottom:1px solid #eaecf0"><h2 style="color:#101828;font-size:28px;font-style:normal;font-weight:600;line-height:128.571%">Hi {{name}},</h2><p style="padding:24px 0;color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%">We received a request to change the email address associated with your NightCode account. To confirm your new email address, please use the following One-Time Password (OTP): {{code}}</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">Please enter it on the email change confirmation page to proceed.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">If you did not request to change your email address, please ignore this email. Your current email address remains secure.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">Best regards,</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">NightCode Team</p></td>`,
                    messageText: `<td style="padding:32px 24px;border-bottom:1px solid #eaecf0"><h2 style="color:#101828;font-size:28px;font-style:normal;font-weight:600;line-height:128.571%">Hi {{name}},</h2><p style="padding:24px 0;color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%">We received a request to change the email address associated with your NightCode account. To confirm your new email address, please use the following One-Time Password (OTP): {{code}}</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">Please enter it on the email change confirmation page to proceed.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:400;line-height:150%;padding:0 0 20px 0">If you did not request to change your email address, please ignore this email. Your current email address remains secure.</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">Best regards,</p><p style="color:#344054;font-size:16px;font-style:normal;font-weight:700;line-height:150%">NightCode Team</p></td>`,
                    languageId: defaultLanguage
                }]
            }
        ],
        {
            include: [{model:Models.EmailTemplateContent}]
        }
    );

   
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
