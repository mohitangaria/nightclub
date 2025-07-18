'use strict';
const {Models} = require("../dist/models");
const Common = require("../dist/controllers/common");
const Constants = require("../dist/constants");
const Bcrypt = require("bcrypt");
const { Op } = require("../dist/config/dbImporter");
const Moment = require("moment");
const { tcpPingPort } = require("tcp-ping-port");
const dotenv = require("dotenv");
dotenv.config({ encoding: "utf8" });
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    let SELECT={ type: queryInterface.sequelize.QueryTypes.SELECT }
    let initializations = await queryInterface.sequelize.query("select id from roles",SELECT);
    if (initializations.length == 0) {
      let languages = await queryInterface.sequelize.query("select id from languages where code='en'",SELECT);
      let admnRole = await queryInterface.bulkInsert("roles",
        [
          {
            code: "admin",
            status: 1,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        { returning: ["id"] }
      );
      if (admnRole) {
        let admnRoleContent = await queryInterface.bulkInsert(
          "roles_content",
          [
            {
              name: "Administrator",
              language_id: languages[0].id,
              role_id: admnRole,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          { returning: ["id"] }
        );
        if (admnRoleContent) {
          console.log("Admin role initialized");
        }
      }

      let userrole = await queryInterface.bulkInsert(
        "roles",
        [
          {
            code: "user",
            status: 1,
            is_default: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        { returning: ["id"] }
      );
      if (userrole) {
        let admnRoleContent = await queryInterface.bulkInsert(
          "roles_content",
          [
            {
              name: "User",
              language_id: languages[0].id,
              role_id: userrole,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          { returning: ["id"] }
        );
        if (admnRoleContent) {
          console.log("User role initialized");
        }
      }
      
    }
    const transaction = await queryInterface.sequelize.transaction();
    try {
      let userVerification = await Models.User.findOne({ where: { id: { [Op.gt]: 0 } } });
      if (!userVerification) {
        const rounds = parseInt(process.env.HASH_ROUNDS);
        const superAdminPassword = Bcrypt.hashSync(process.env.SUPERADMIN_PASSWORD, rounds);
        let superadmin = await Models.User.create(
          {
            email: process.env.SUPERADMIN_EMAIL, password: superAdminPassword,
            status: Constants.STATUS.ACTIVE, username: "superadmin",
            userProfile: { name: "Administrator", imageId: null },
            userAccounts: [ { accountId: null, isDefault: true } ],
          },
          {
            include: [
              { model: Models.UserProfile, as: "userProfile" },
              { model: Models.UserAccount, as: "userAccounts" },
            ],
            transaction: transaction,
          }
        );

        if(superadmin) {
          let adminRole = await Models.Role.findOne({
            where: { code: "admin" },
          });

          await superadmin.addRoles([adminRole.id], {
            transaction: transaction,
          });
        } else {
          // rollback;
          await transaction.rollback();
          console.log("Unable to create super admin account");
        }
          await transaction.commit();
      } else {
        console.log("System already initialized");
      }
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      console.log("Unable to initialize system with super admin account");
    }
  },
  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    //await queryInterface.bulkDelete('account_roles',[ {[Op.or]: [{code: 'admin'}, {code: 'user'}]}]);
  },
};