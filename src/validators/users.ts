import { Joi, Common, _ } from "../config/routeImporter";

// ######################################################################### request validator #########################################################################

const signupRequest: Joi.ObjectSchema = Joi.object().keys({
  email: Joi.string().trim().email().max(255).required()
    .example("email@domain.com")
    .description("User's email address for account creation")
    .error(errors => { return Common.routeError(errors, 'EMAIL_IS_REQUIRED_AND_MUST_BE_VALID_EMAIL_ID') }),

  password: Joi.string().trim().max(255).required()
    .example('password')
    .description("User's password for account security")
    .error(errors => { return Common.routeError(errors, 'PASSWORD_IS_REQUIRED') }),

  name: Joi.string().max(255).trim().required()
    .example('John Doe')
    .description("User's full name")
    .error(errors => { return Common.routeError(errors, 'NAME_IS_REQUIRED') }),

  mobile: Joi.string().trim().required()
    .pattern(/^\d+$/)
    .example("1234567890")
    .description("The new mobile number associated with the account, which must contain only digits.")
    .error(errors => { return Common.routeError(errors, 'MOBILE_IS_REQUIRED_AND_MUST_BE_NUMERIC') }),

  countryCode: Joi.string().trim().required()
    .example("+1")
    .description("The country code associated with the new mobile number.")
    .error(errors => { return Common.routeError(errors, 'COUNTRY_CODE_IS_REQUIRED') }),

  // role: Joi.string().trim().required()
  //   .valid('user', 'seller')
  //   .example('user')
  //   .description("Code representing the user's role within the system")
  //   .error(errors => { return Common.routeError(errors, 'ROLE_IS_REQUIRED') })
}).label('signup-request')
  .description("Schema for validating user signup requests, including email, password, name, and role.");

const verifyTokenRequest: Joi.ObjectSchema = Joi.object().keys({
  token: Joi.string().trim().required()
    .example('otp_token_value')
    .description("The OTP token that was received after sending the OTP request")
    .error(errors => { return Common.routeError(errors, 'TOKEN_IS_REQUIRED') }),

  code: Joi.string().trim().required()
    .example('9999')
    .description("The OTP code received by the user for verification")
    .error(errors => { return Common.routeError(errors, 'CODE_IS_REQUIRED_AND_MUST_BE_NUMERIC') })
}).label('verify-token-request')
  .description("Schema for validating the OTP verification request, including the token and the code received by the user.");


const resetPasswordRequest: Joi.ObjectSchema = Joi.object().keys({
  token: Joi.string().trim().required()
    .example('otp_token_value')
    .description("The OTP token received after requesting a password reset")
    .error(errors => { return Common.routeError(errors, 'TOKEN_IS_REQUIRED') }),

  code: Joi.string().trim().required()
    .example('9999')
    .description("The OTP code received by the user for password reset verification")
    .error(errors => { return Common.routeError(errors, 'CODE_IS_REQUIRED_AND_MUST_BE_NUMERIC') }),

  password: Joi.string().trim().required()
    .example('new_password')
    .description("The new password for the account")
    .error(errors => { return Common.routeError(errors, 'PASSWORD_IS_REQUIRED') }),
}).label('reset-password-request')
  .description("Schema for validating the OTP verification and password reset request, including the token, code, and new password.");

const resendCodeRequest: Joi.ObjectSchema = Joi.object().keys({
  token: Joi.string().trim().required()
    .example('otp_token_value')
    .description("The OTP token received after requesting a password reset")
    .error(errors => { return Common.routeError(errors, 'TOKEN_IS_REQUIRED') }),
}).label('resend-code-request')
  .description("Schema for validating the OTP verification and password reset request, including the token, code, and new password.");

const changePasswordRequest: Joi.ObjectSchema = Joi.object().keys({
  password: Joi.string().trim().required()
    .example('new_password')
    .description("The new password for the account")
    .error(errors => { return Common.routeError(errors, 'PASSWORD_IS_REQUIRED') }),

  oldPassword: Joi.string().trim().optional()
    .example('old_password')
    .description("The old password for the account, required if the account already has a set password")
    .error(errors => { return Common.routeError(errors, 'IF_ACCOUNT_HAS_OLD_PASSWORD') }),
}).label('change-password-request')
  .description("Schema for validating the password change request, requiring the new password and optionally the old password.");


const loginRequest: Joi.ObjectSchema = Joi.object().keys({
  email: Joi.string().trim().email().required()
    .example("email@domain.com")
    .description("The user's email address for logging in")
    .error(errors => { return Common.routeError(errors, 'EMAIL_IS_REQUIRED_AND_MUST_BE_VALID_EMAIL_ID') }),

  password: Joi.string().trim().required()
    .example('password')
    .description("The user's password for logging in")
    .error(errors => { return Common.routeError(errors, 'PASSWORD_IS_REQUIRED') }),
}).label('login-request')
  .description("Schema for validating the login request, allowing for email and password or mobile number, country code, and password.");


const socialLoginRequest: Joi.ObjectSchema = Joi.object().keys({
  accessToken: Joi.string().trim().required()
    .example('abc123token')
    .description("The access token obtained from the social platform")
    .error(errors => { return Common.routeError(errors, 'ACCESS_TOKEN_IS_REQUIRED') }),

  name: Joi.string().trim().required()
    .example('John Doe')
    .description("The user's full name")
    .error(errors => { return Common.routeError(errors, 'NAME_IS_REQUIRED') }),

  email: Joi.string().trim().email().required()
    .example('john.doe@example.com')
    .description("The user's email address")
    .error(errors => { return Common.routeError(errors, 'EMAIL_IS_REQUIRED_AND_MUST_BE_VALID_EMAIL') }),

  platform: Joi.string().trim().required().valid("google", "facebook", "apple")
    .example('google')
    .description("The social platform used for login (e.g., Google or Facebook or Apple)")
    .error(errors => { return Common.routeError(errors, 'PLATFORM_IS_REQUIRED') }),
}).label('social-login-request')
  .description("Schema for validating the social login request, including the access token, user's name, email, and the social platform used.");

const refreshTokenRequest: Joi.ObjectSchema = Joi.object().keys({
  refreshToken: Joi.string().trim().required()
    .example('abc123token')
    .description("The access token obtained from the social platform")
    .error(errors => { return Common.routeError(errors, 'ACCESS_TOKEN_IS_REQUIRED') })
}).label('srefresh-token-request')
  .description("Schema for validating the social login request, including the access token, user's name, email, and the social platform used.");


const changeStatusRequest: Joi.ObjectSchema = Joi.object().keys({
  status: Joi.number().valid(0, 1).required()
    .example(1)
    .description("The status value indicating the desired state, where 0 represents inactive and 1 represents active.")
    .error(errors => { return Common.routeError(errors, 'STATUS_IS_REQUIRED') }),
}).label('change-status-request')
  .description("Schema for validating the request to change the status, allowing only values 0 (inactive) and 1 (active).");


const approveAccountRequest: Joi.ObjectSchema = Joi.object().keys({
  status: Joi.number().valid(0, 1, 2, 3).required()
    .example(1)
    .description("The status value indicating the desired state, where 0 represents pending, 1 represents approved, and 2 represents rejected and 3 represents preapproved.")
    .error(errors => { return Common.routeError(errors, 'STATUS_IS_REQUIRED') }),

  comment: Joi.string().optional().default(null).allow(null)
    .example("Approval required from the manager.")
    .description("An optional comment related to the status change, such as reasons for pending approval or other remarks.")
    .error(errors => { return Common.routeError(errors, 'COMMENT_IS_INVALID') }),
}).label('approve-account-request')
  .description("Schema for validating the request to change account status, including status and optional comments.");
  

const forgetPasswordRequest: Joi.ObjectSchema = Joi.object().keys({
  email: Joi.string().trim().email().required()
    .example("email@domain.com")
    .description("The email address associated with the account for password reset.")
    .error(errors => { return Common.routeError(errors, 'EMAIL_IS_REQUIRED_AND_MUST_BE_VALID_EMAIL_ID') }),
}).label('forgot-password-request')
  .description("Schema for validating a forget password request, requiring a valid email address.");
  

const changeMobileRequest: Joi.ObjectSchema = Joi.object().keys({
  mobile: Joi.string().trim().required()
    .pattern(/^\d+$/)
    .example("1234567890")
    .description("The new mobile number associated with the account, which must contain only digits.")
    .error(errors => { return Common.routeError(errors, 'MOBILE_IS_REQUIRED_AND_MUST_BE_NUMERIC') }),

  countryCode: Joi.string().trim().required()
    .example("+1")
    .description("The country code associated with the new mobile number.")
    .error(errors => { return Common.routeError(errors, 'COUNTRY_CODE_IS_REQUIRED') }),
}).label('change-mobile-request')
  .description("Schema for validating a request to change the mobile number, requiring both the mobile number (which must be numeric) and country code.");



const fetchUserListRequest: Joi.ObjectSchema = Joi.object().keys({
  searchText: Joi.string().trim().optional()
    .example('John Doe')
    .description("Optional text to search and filter users by name")
    .error(errors => { return Common.routeError(errors, 'SEARCH_TEXT_MUST_BE_STRING') }),

  page: Joi.number().integer().optional().default(1)
    .example(1)
    .description("Optional page number for pagination, default is 1")
    .error(errors => { return Common.routeError(errors, 'PAGE_NUMBER_MUST_BE_INTEGER') }),

  perPage: Joi.number().integer().optional().default(20)
    .example(20)
    .description("Optional number of users per page, default is 20")
    .error(errors => { return Common.routeError(errors, 'PER_PAGE_MUST_BE_INTEGER') }),

  userType: Joi.string().trim().optional().valid("buyer", "seller", "requested-seller","staff").default(null)
    .example("buyer")
    .description("Optional parameter to filter users as per roles")
    .error(errors => { return Common.routeError(errors, 'USERTYPE_MUST_BE_STRING') }),

  sortParameter: Joi.string().trim().optional().valid("id", "createdAt", "updatedAt").default("id")
    .example('id')
    .description("Optional parameter to sort users by, default is 'id'")
    .error(errors => { return Common.routeError(errors, 'SORT_PARAMETER_MUST_BE_STRING') }),

  sortValue: Joi.string().trim().optional().valid("asc", "desc").default("desc")
    .example('desc')
    .description("Optional sort order, can be 'asc' or 'desc', default is 'desc'")
    .error(errors => { return Common.routeError(errors, 'SORT_VALUE_MUST_BE_STRING') }),

  status: Joi.string().trim().optional().default(null)
    .example('active')
    .description("Optional filter to show users by their status")
    .error(errors => { return Common.routeError(errors, 'STATUS_MUST_BE_STRING') }),
}).label('fetch-user-list-request')
  .description("Schema for validating the request to fetch a user list, including optional filters, pagination settings, sorting parameters, and status filters.");


const createSellerProfileRequest: Joi.ObjectSchema = Joi.object().keys({
  name: Joi.string().trim().required()
    .example('John Doe')
    .description("The name of the seller or entity")
    .error(errors => { return Common.routeError(errors, 'NAME_IS_REQUIRED') }),

  contactEmail: Joi.string().trim().email().allow(null, "").optional().default(null)
    .example('john.doe@example.com')
    .description("The contact email address for the seller or entity")
    .error(errors => { return Common.routeError(errors, 'CONTACT_EMAIL_IS_REQUIRED_AND_MUST_BE_VALID_EMAIL') }),

  contactCountryCode: Joi.string().trim().required()
    .example('+1')
    .description("The contact email address for the seller or entity")
    .error(errors => { return Common.routeError(errors, 'COUNTRY_CODE_IS_REQUIRED_AND_MUST_BE_VALID_EMAIL') }),

  contactPhone: Joi.string().trim().required()
    .example('1234567890')
    .description("The contact email address for the seller or entity")
    .error(errors => { return Common.routeError(errors, 'CONTACT_PHONE_IS_REQUIRED_AND_MUST_BE_VALID_EMAIL') }),

  storeUrl: Joi.string().trim().optional().allow(null, "").default(null,)
    .example('https://www.example.com')
    .description("The URL of the seller's online store")
    .error(errors => { return Common.routeError(errors, 'STORE_URL_IS_REQUIRED_AND_MUST_BE_VALID_URL') }),

  socialMediaLink: Joi.string().trim().optional().allow(null, "").default(null)
    .example('https://www.twitter.com/johndoe')
    .description("The URL to the seller's social media profile")
    .error(errors => { return Common.routeError(errors, 'SOCIAL_MEDIA_LINK_IS_REQUIRED_AND_MUST_BE_VALID_URL') }),

  attachmentId: Joi.number().optional()
    .example(1)
    .default(null)
    .description("Optional ID for any attachment related to the seller or entity")
    .error(errors => { return Common.routeError(errors, 'ATTACHMENT_ID_MUST_BE_NUMBER') }),
}).label('create-seller-profile-request')
  .description("Schema for creating a seller profile, including required fields such as name, contact email, store URL, and social media link, with an optional attachment ID.");


const updateSellerProfileRequest: Joi.ObjectSchema = Joi.object().keys({
  name: Joi.string().trim().optional().allow(null, "")
    .example('John Doe')
    .description("The name of the seller or entity. Can be left null or an empty string if not updating")
    .error(errors => { return Common.routeError(errors, 'NAME_MUST_BE_STRING') }),

  contactEmail: Joi.string().trim().email().optional().allow(null, "")
    .example('john.doe@example.com')
    .description("The contact email address for the seller or entity. Can be left null or an empty string if not updating")
    .error(errors => { return Common.routeError(errors, 'CONTACT_EMAIL_MUST_BE_VALID_EMAIL') }),

  contactCountryCode: Joi.string().trim().optional().allow(null, "")
    .example('+1')
    .description("The contact email address for the seller or entity")
    .error(errors => { return Common.routeError(errors, 'COUNTRY_CODE_IS_REQUIRED_AND_MUST_BE_VALID_EMAIL') }),

  contactPhone: Joi.string().trim().optional().allow(null, "")
    .example('1234567890')
    .description("The contact email address for the seller or entity")
    .error(errors => { return Common.routeError(errors, 'CONTACT_PHONE_IS_REQUIRED_AND_MUST_BE_VALID_EMAIL') }),

  storeUrl: Joi.string().trim().optional().allow(null, "")
    .example('https://www.example.com')
    .description("The URL of the seller's online store. Can be left null or an empty string if not updating")
    .error(errors => { return Common.routeError(errors, 'STORE_URL_MUST_BE_VALID_URL') }),

  socialMediaLink: Joi.string().trim().optional().allow(null, "")
    .example('https://www.twitter.com/johndoe')
    .description("The URL to the seller's social media profile. Can be left null or an empty string if not updating")
    .error(errors => { return Common.routeError(errors, 'SOCIAL_MEDIA_LINK_MUST_BE_VALID_URL') }),

  attachmentId: Joi.number().optional().allow(null, "")
    .example(1)
    .default(null)
    .description("Optional ID for any attachment related to the seller or entity. Can be left null if not updating")
    .error(errors => { return Common.routeError(errors, 'ATTACHMENT_ID_MUST_BE_NUMBER') }),
}).label('update-seller-profile-request')
  .description("Schema for updating a seller profile with optional fields: name, contact email, store URL, social media link, and attachment ID.");

const updateUserProfileRequest: Joi.ObjectSchema = Joi.object().keys({
  name: Joi.string().max(255).trim().required()
    .example('John Doe')
    .description("The full name of the user or entity. Must be a non-empty string if provided.")
    .error(errors => { return Common.routeError(errors, 'NAME_MUST_BE_STRING') }),

  attachmentId: Joi.number().optional().allow(null, "")
    .example(1).default(null)
    .description("Optional ID for any attachment related to the user or entity. Can be null or an empty string if not applicable.")
    .error(errors => { return Common.routeError(errors, 'ATTACHMENT_ID_MUST_BE_NUMBER') }),
}).label('update-user-profile-request')
  .description("Schema for updating a user profile, allowing optional fields: name and attachment ID.");
  

  const createShopDocRequest: Joi.ObjectSchema = Joi.object().keys({
    businessName: Joi.string().trim().required()
      .example('Example Business')
      .description('The name of the business')
      .error(errors => { return Common.routeError(errors, 'BUSINESS_NAME_IS_REQUIRED') }),
  
    companyAddress: Joi.string().trim().required()
      .example('123 Example Street, Example City, EX 12345')
      .description('The address of the company')
      .error(errors => { return Common.routeError(errors, 'COMPANY_ADDRESS_IS_REQUIRED') }),
  
    phone: Joi.string().trim().required()
      .example('+1234567890')
      .description('The contact phone number of the business')
      .error(errors => { return Common.routeError(errors, 'PHONE_IS_REQUIRED') }),
  
    taxIdNumber: Joi.string().trim().required()
      .example('AB123456C')
      .description('The tax identification number of the business')
      .error(errors => { return Common.routeError(errors, 'TAX_ID_NUMBER_IS_REQUIRED') }),
  
    contactName: Joi.string().trim().required()
      .example('John Doe')
      .description('The name of the contact person for the business')
      .error(errors => { return Common.routeError(errors, 'CONTACT_NAME_IS_REQUIRED') }),
  
    contactEmail: Joi.string().trim().email().required()
      .example('contact@example.com')
      .description('The contact email address for the business')
      .error(errors => { return Common.routeError(errors, 'CONTACT_EMAIL_IS_REQUIRED_AND_MUST_BE_VALID_EMAIL') }),
  
    contactDirectDial: Joi.string().trim().required()
      .example('+0987654321')
      .description('The direct dial phone number for the contact person')
      .error(errors => { return Common.routeError(errors, 'CONTACT_DIRECT_DIAL_IS_REQUIRED') }),
  }).label('create-shop-doc-request')
    .description('Schema for creating a shop document request, including required fields such as business name, company address, phone number, tax ID number, contact name, contact email, and direct dial phone number.');
  

  


// ######################################################################### response validator #########################################################################


const userResponse: Joi.ObjectSchema = Joi.object().keys({
  message: Joi.string().trim().example("REQUEST_SUCCESSFULL").description("A message indicating the success of the request").error(errors => { return Common.routeError(errors, 'MESSAGE_IS_REQUIRED') }),

  responseData: Joi.object().keys({
    id: Joi.number().integer().required().example(4).description("Unique identifier for the user").error(errors => { return Common.routeError(errors, 'ID_IS_REQUIRED') }),
    accountId: Joi.number().integer().allow(null).example(null).description("Linked account identifier, if applicable"),
    email: Joi.string().trim().email().required().example("12345@domain.com").description("The user's email address").error(errors => { return Common.routeError(errors, 'EMAIL_IS_REQUIRED_AND_MUST_BE_VALID_EMAIL') }),
    countryCode: Joi.string().trim().allow(null).example(null).description("Country code of the user's phone number"),
    mobile: Joi.string().trim().allow(null).example(null).description("The user's phone number"),
    createdAt: Joi.date().iso().allow(null).example(null).description("Timestamp of when the user record was created"),
    updatedAt: Joi.date().iso().allow(null).example(null).description("Timestamp of the last update to the user record"),
    status: Joi.number().integer().required().example(1).description("Current status of the user").error(errors => { return Common.routeError(errors, 'STATUS_IS_REQUIRED') }),
    token: Joi.string().trim().allow(null).example(null).description("Authentication token for the user session"),
    refreshToken: Joi.string().trim().allow(null).example(null).description("Refresh token for the user session"),
    userProfile: Joi.object().keys({
      name: Joi.string().trim().allow(null).example(null).description("The full name of the user"),
      profileImage: Joi.string().trim().allow(null).example(null).description("URL or path to the user's profile image")
    }).required().description("Details of the user's profile").error(errors => { return Common.routeError(errors, 'USER_PROFILE_IS_REQUIRED') }),
    sellerProfile: Joi.object().keys({
      id: Joi.number().integer().when('sellerProfile', { is: Joi.exist(), then: Joi.required() }).example(1).description("Unique identifier for the seller profile"),
      name: Joi.string().trim().when('sellerProfile', { is: Joi.exist(), then: Joi.required() }).example('Seller Name').description("Name of the seller profile"),
      contactEmail: Joi.string().trim().email().allow(null).example(null).description("Contact email of the seller"),
      contactCountryCode: Joi.string().trim().email().allow(null).example(null).description("Contact email of the seller"),
      contactPhone: Joi.string().trim().email().allow(null).example(null).description("Contact email of the seller"),
      storeUrl: Joi.string().trim().allow(null).example(null).description("Store URL of the seller"),
      socialMediaLink: Joi.string().trim().allow(null).example(null).description("Social media link of the seller"),
      hasSellerAccount: Joi.boolean().optional().example(true).description("Flag indicating if the seller has an account"),
      attachmentId: Joi.number().optional().allow(null).example(null).description("Attachment ID related to the seller profile"),
      isStripeConnected: Joi.boolean().when('sellerProfile', { is: Joi.exist(), then: Joi.required() }).example(false).description("Indicates if the seller's Stripe account is connected"),
      isVerifiedDocuments: Joi.boolean().when('sellerProfile', { is: Joi.exist(), then: Joi.required() }).example(false).description("Indicates if the seller's documents are verified"),
      isVerifiedProfile: Joi.boolean().when('sellerProfile', { is: Joi.exist(), then: Joi.required() }).example(false).description("Indicates if the seller's profile is verified"),
      status: Joi.number().integer().when('sellerProfile', { is: Joi.exist(), then: Joi.required() }).example(1).description("Current status of the seller profile")
    }).optional().allow(null),
    roles: Joi.array().items(
      Joi.object().keys({
        code: Joi.string().trim().example("user").description("Role code"),
        status: Joi.number().integer().example(1).description("Status of the role"),
        name: Joi.string().trim().example("User").description("Name of the role"),
        Permissions: Joi.array().items(
          Joi.string().trim().example("user").description("Permissions associated with this role")
        )
      })
    ).required().description("Roles assigned to the user").error(errors => { return Common.routeError(errors, 'ROLES_ARE_REQUIRED') }),
    permissions: Joi.array().items(
      Joi.string().trim().example("user").description("Additional permissions directly assigned to the user")
    ).required().description("Direct permissions assigned to the user").error(errors => { return Common.routeError(errors, 'PERMISSIONS_ARE_REQUIRED') })
  })
}).label('user-response').description("Response object containing details of the user including profile information, roles, and permissions");


const otpResponse: Joi.ObjectSchema = Joi.object().keys({
  message: Joi.string().trim().example("Success message from server").description("A message indicating the success of the OTP request").error(errors => { return Common.routeError(errors, 'MESSAGE_IS_REQUIRED') }),
  responseData: Joi.object().keys({
    token: Joi.string().trim().required().example("your_token_here").description("OTP token generated for the request").error(errors => { return Common.routeError(errors, 'TOKEN_IS_REQUIRED') })
  }).required().description("Contains the OTP token generated for the request")
}).label('otp-response').description("Response model for OTP request, including the generated token and success message");



export {
  signupRequest,
  otpResponse,
  verifyTokenRequest,
  loginRequest,
  userResponse,
  forgetPasswordRequest,
  resetPasswordRequest,
  changePasswordRequest,
  fetchUserListRequest,
  createSellerProfileRequest,
  updateSellerProfileRequest,
  socialLoginRequest,
  changeStatusRequest,
  updateUserProfileRequest,
  changeMobileRequest,
  resendCodeRequest,
  approveAccountRequest,
  createShopDocRequest,
  refreshTokenRequest
}