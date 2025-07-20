import { Joi, Common, _ } from "../config/routeImporter";

const addBankDetailsRequest: Joi.ObjectSchema = Joi.object().keys({
    accountHolderName: Joi.string().trim().required()
      .example("John Doe")
      .description("The name of the account holder")
      .error(errors => { return Common.routeError(errors, 'ACCOUNT_HOLDER_NAME_MUST_BE_STRING') }),
  
    routingNumber: Joi.string().trim().required()
      .example("123456789")
      .description("The routing number of the bank")
      .error(errors => { return Common.routeError(errors, 'ROUTING_NUMBER_MUST_BE_STRING') }),
  
    accountNumber: Joi.string().trim().required()
      .example("987654321")
      .description("The bank account number")
      .error(errors => { return Common.routeError(errors, 'ACCOUNT_NUMBER_MUST_BE_STRING') }),
  
    bankName: Joi.string().trim().required()
      .example("987654321")
      .description("The bank account number for confirmation, must match the account number")
      .error(errors => { return Common.routeError(errors, 'BANK_NAME_MUST_BE_STRING') }),
}).label('add-bank-details-request')
  .description("Schema for validating the addition of bank details, including account holder name, routing number, account number, and confirmation of account number.");
  
export { addBankDetailsRequest };
  