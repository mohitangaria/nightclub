const STATUS = {
  INACTIVE: 0,
  ACTIVE: 1
};

const USER_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1
};

const DOCUMENT_STATUS = {
  INACTIVE: 0,
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3
}


const IMPORT_STATUS = {
  PENDING: 0,
  QUEUED: 1,
  INPROCESS: 2,
  PROCESSED: 3,
  FAILED: 4
};

const LANGUAGE = {
  en: 1,
  fr: 3,
};

const ATTACHMENT_TYPE = {
  LOCAL: 1,
  S3_BUCKET: 2,
};

const CAMPAIGN_STATUS = {
  SCHEDULED: 0
}
const AUTOMATION_STATUS = {
  SCHEDULED: 0
}

const AUTOMATION_CALCULATION_FROM = {
  SUBSCRIPTION_DATE: 1,
  LIST_CREATION_DATE: 2
};

const INTERVAL_TYPE = {
  DAY: 1,
  WEEK: 2,
  MONTH: 3,
  YEAR: 4
}

const TOKEN_TYPES = {
  SIGNUP: "signup",
  FORGET_PASSWORD: "forgetpassword",
  CHANGE_EMAIL: "change-email",
  CHANGE_MOBILE: "change-mobile",
  AGREEMENT: "agreement"
}

const ADDRESS_TYPES = {
  PICKUP: "pickup",
  RETURN: "return",
  OTHER: "other"
}

const ADDRESS_ENTITY = {
  BUYER: "buyer",
  SELLER: "seller",
  SHOP: "shop"
}

const BLOCKED = {
  EMAIL_CODES: ['SIGNUP', 'FORGOT_PASSWORD', 'RESET_PASSWORD']
}

const ATTRIBUTE_TYPE = {
  TEXT: 1,
  DROPDOWN: 2
};

const SELLER_STATUS = {
  NO_SELLER: 0,
  CREATED_REQUEST: 1,
  DOCUMENT_GENERATED: 2,
  DOCUMENT_SIGNED: 3,
  ACCOUNT_APPROVED: 4,
  ACCOUNT_REJECTED: 5,
  DOCUMENT_REGENERATED: 6,
  PRE_APPROVED: 7,
  DOC_DETAILS_SUBMITTED: 8
}

const PRODUCT_TYPE = {
  RENT: 1,
  BUY: 2,
  PRE_LOVED: 3
}

const PRODUCT_APPROVAL_STATUS = {
  NOT_SENT_FOR_APPROVAL: 0,
  SENT_FOR_APPROVAL: 1,
  APPROVED: 2,
  REJECTED: 3
}

const PRODUCT_DIMENSIONS = {
  1: "15 x 15 x 10 cm",
  2: "15 x 15 x 15 cm",
  3: "15 x 15 x 20 cm",
}

const WEIHGT_UNIT = {
  POUND: 1,
  KG: 2
}

export {
  STATUS,
  IMPORT_STATUS,
  CAMPAIGN_STATUS,
  AUTOMATION_STATUS,
  LANGUAGE,
  ATTACHMENT_TYPE,
  BLOCKED,
  AUTOMATION_CALCULATION_FROM,
  TOKEN_TYPES,
  USER_STATUS,
  DOCUMENT_STATUS,
  ATTRIBUTE_TYPE,
  ADDRESS_TYPES,
  ADDRESS_ENTITY,
  SELLER_STATUS,
  PRODUCT_TYPE,
  PRODUCT_APPROVAL_STATUS
}
