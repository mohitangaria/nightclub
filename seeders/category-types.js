'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    let initializations = await queryInterface.sequelize.query("select id from categories_types", { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (initializations.length == 0) {
      let categoryType = await queryInterface.bulkInsert('categories_types',
        [
          { code: 'permission', status: 1, created_at: new Date(), updated_at: new Date() }
        ],
        { returning: true });
      if (categoryType) {
        let directoryCategotyTypeId = categoryType + 1;
        let languages = await queryInterface.sequelize.query("select id from languages where code='en'", { type: queryInterface.sequelize.QueryTypes.SELECT });
        if (languages) {
          let insertCategoryContent = await queryInterface.bulkInsert('categories_types_content', [
            {
              name: 'Permission Category',
              description: 'Categorytype to manage permissions',
              description_text: 'Categorytype to manage permissions',
              language_id: languages[0].id,
              categorytype_id:
                categoryType, created_at: new Date(),
              updated_at: new Date()
            }
          ], 
          { returning: ['id'] });
        }
      }
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
