#npx npm-check-updates
npx sequelize db:seed --seed languages.js --config ./dist/config/config.js
npx sequelize db:seed --seed category-types.js --config ./dist/config/config.js
npx sequelize db:seed --seed user-and-roles.js --config ./dist/config/config.js
npx sequelize db:seed --seed emails.js --config ./dist/config/config.js