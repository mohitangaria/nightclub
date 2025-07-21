import { Joi, Common, _ } from "../config/routeImporter";

// ######################################################################### request validator #########################################################################

const createSupportRequest = Joi.object({
  subject: Joi.string().trim().example("My ticket is not booked").description("Subject of ticket").error(errors => { return Common.routeError(errors, 'SUBJECT_IS_REQUIRED') }),
  message: Joi.string().trim().example("Money deducted and ticket not booked").description("Detail of ticket").error(errors => { return Common.routeError(errors, 'MESSAGE_IS_REQUIRED') }),
});

const adminReplyRequest = Joi.object({
  adminReply: Joi.string().required().label('Admin Reply'),
  status: Joi.number().valid(1, 2).required().label('Status (1->In Progress, 2->Closed)'),
});

const fetchSupportListRequest: Joi.ObjectSchema = Joi.object().keys({
  searchText: Joi.string().trim().optional()
    .example('John Doe')
    .description("Optional text to search and filter ticket by name")
    .error(errors => { return Common.routeError(errors, 'SEARCH_TEXT_MUST_BE_STRING') }),

  page: Joi.number().integer().optional().default(1)
    .example(1)
    .description("Optional page number for pagination, default is 1")
    .error(errors => { return Common.routeError(errors, 'PAGE_NUMBER_MUST_BE_INTEGER') }),

  perPage: Joi.number().integer().optional().default(20)
    .example(20)
    .description("Optional number of ticket per page, default is 20")
    .error(errors => { return Common.routeError(errors, 'PER_PAGE_MUST_BE_INTEGER') }),

  sortParameter: Joi.string().trim().optional().valid("id", "createdAt", "updatedAt").default("id")
    .example('id')
    .description("Optional parameter to sort ticket by, default is 'id'")
    .error(errors => { return Common.routeError(errors, 'SORT_PARAMETER_MUST_BE_STRING') }),

  sortValue: Joi.string().trim().optional().valid("asc", "desc").default("desc")
    .example('desc')
    .description("Optional sort order, can be 'asc' or 'desc', default is 'desc'")
    .error(errors => { return Common.routeError(errors, 'SORT_VALUE_MUST_BE_STRING') }),

  status: Joi.string().trim().optional().default(null)
    .example('active')
    .description("Optional filter to show ticket by their status")
    .error(errors => { return Common.routeError(errors, 'STATUS_MUST_BE_STRING') }),
}).label('fetch-ticket-list-request')
  .description("Schema for validating the request to fetch a ticket list, including optional filters, pagination settings, sorting parameters, and status filters.");



export {
  createSupportRequest,
  adminReplyRequest,
  fetchSupportListRequest,
}