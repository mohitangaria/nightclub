import dotenv from "dotenv";
dotenv.config({ encoding: 'utf8' });

interface connectionSchema {
    "DB_NAME": string,
    "DB_USER_NAME": string,
    "DB_PASSWORD": string,
    "DB_HOST": string,
    "dialect": string,
    "host": string,
    "username": string,
    "password": string,
    "database": string,
    "port": number
}
interface dbConnection {
    "LOCAL": connectionSchema,
    "TEST": connectionSchema
    "QA": connectionSchema
    "DEVELOPMENT": connectionSchema
    "PRODUCTION": connectionSchema,
}

const config: dbConnection = {
    "LOCAL": {
        "DB_NAME": process.env.MYSQL_LOCAL_DATABASE_NAME!,
        "DB_USER_NAME": process.env.MYSQL_LOCAL_USER_NAME!,
        "DB_PASSWORD": process.env.MYSQL_LOCAL_PASSWORD!,
        "DB_HOST": process.env.MYSQL_LOCAL_HOST!,
        "dialect": process.env.MYSQL_DIALECT!,
        "host": process.env.MYSQL_LOCAL_HOST!,
        "username": process.env.MYSQL_LOCAL_USER_NAME!,
        "password": process.env.MYSQL_LOCAL_PASSWORD!,
        "database": process.env.MYSQL_LOCAL_DATABASE_NAME!,
        "port": +process.env.MYSQL_PORT!
    },
    "TEST": {
        "DB_NAME": process.env.MYSQL_TEST_DATABASE_NAME!,
        "DB_USER_NAME": process.env.MYSQL_TEST_USER_NAME!,
        "DB_PASSWORD": process.env.MYSQL_TEST_PASSWORD!,
        "DB_HOST": process.env.MYSQL_TEST_HOST!,
        "dialect": process.env.MYSQL_DIALECT!,
        "host": process.env.MYSQL_TEST_HOST!,
        "username": process.env.MYSQL_TEST_USER_NAME!,
        "password": process.env.MYSQL_TEST_PASSWORD!,
        "database": process.env.MYSQL_TEST_DATABASE_NAME!,
        "port": +process.env.MYSQL_PORT!
    },
    "QA": {
        "DB_NAME": process.env.MYSQL_QA_DATABASE_NAME!,
        "DB_USER_NAME": process.env.MYSQL_QA_USER_NAME!,
        "DB_PASSWORD": process.env.MYSQL_QA_PASSWORD!,
        "DB_HOST": process.env.MYSQL_QA_HOST!,
        "dialect": process.env.MYSQL_DIALECT!,
        "host": process.env.MYSQL_QA_HOST!,
        "username": process.env.MYSQL_QA_USER_NAME!,
        "password": process.env.MYSQL_QA_PASSWORD!,
        "database": process.env.MYSQL_QA_DATABASE_NAME!,
        "port": +process.env.MYSQL_PORT!
    },
    "DEVELOPMENT": {
        "DB_NAME": process.env.MYSQL_DEVELOPMENT_DATABASE_NAME!,
        "DB_USER_NAME": process.env.MYSQL_DEVELOPMENT_USER_NAME!,
        "DB_PASSWORD": process.env.MYSQL_DEVELOPMENT_PASSWORD!,
        "DB_HOST": process.env.MYSQL_DEVELOPMENT_HOST!,
        "dialect": process.env.MYSQL_DIALECT!,
        "host": process.env.MYSQL_DEVELOPMENT_HOST!,
        "username": process.env.MYSQL_DEVELOPMENT_USER_NAME!,
        "password": process.env.MYSQL_DEVELOPMENT_PASSWORD!,
        "database": process.env.MYSQL_DEVELOPMENT_DATABASE_NAME!,
        "port": +process.env.MYSQL_PORT!
    },
    "PRODUCTION": {
        "DB_NAME": process.env.MYSQL_DATABASE_NAME!,
        "DB_USER_NAME": process.env.MYSQL_USER_NAME!,
        "DB_PASSWORD": process.env.MYSQL_PASSWORD!,
        "DB_HOST": process.env.MYSQL_HOST!,
        "dialect": process.env.MYSQL_DIALECT!,
        "host": process.env.MYSQL_HOST!,
        "username": process.env.MYSQL_USER_NAME!,
        "password": process.env.MYSQL_PASSWORD!,
        "database": process.env.MYSQL_DATABASE_NAME!,
        "port": +process.env.MYSQL_PORT!
    }
}
module.exports = config