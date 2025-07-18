const STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
};
  
const LANGUAGE = {
  en: 1,
  fr: 3,
};
  
const ATTACHMENT_TYPE = {
  LOCAL: 1,
  S3_BUCKET: 2,
};
  
const UserProfileAttributes: string[] = ['name'];
  
const AttachmentAttributes: string[] = ['id', 'uniqueName', 'filePath', 'fileName'];
  
const PAYMENT_STATUS = {
  created: 0,
  captured: 2,
  refunded: 3,
  failed: 4,
  authorized: 5,
};


const QUESTION_TYPES = {
  name: 1,
  dob:2,
  gender:3,
  profilePic:4,
  videoShow:5,
  photoShow:6,
  textDescriptions:7,
  checkbox:8,
  radio:9,
  input:10,
  longMessage:11


};

const USER_TYPES = {
  employee: 1,
  preOnboarding: 2
}

const WORKING_MINUTES = 480

export {
  STATUS,
  LANGUAGE,
  ATTACHMENT_TYPE,
  UserProfileAttributes,
  AttachmentAttributes,
  PAYMENT_STATUS,
  QUESTION_TYPES,
  USER_TYPES,
  WORKING_MINUTES

}
  