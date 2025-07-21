import { Common, Joi } from "../config/routeImporter";
import * as User from "../controllers/users";
import { signupRequest, verifyTokenRequest, loginRequest, forgetPasswordRequest, resetPasswordRequest, changePasswordRequest, fetchUserListRequest, createSellerProfileRequest, updateSellerProfileRequest, socialLoginRequest, changeStatusRequest, updateUserProfileRequest, changeMobileRequest, resendCodeRequest, approveAccountRequest, createShopDocRequest, refreshTokenRequest, updateUserSettings } from "../validators/users";
import { otpResponse, userResponse } from "../validators/users";
import { authorizedheaders, optional_authorizedheaders, headers, options, validator, respmessage, resp400, resp500, identifierRequest } from "../validators/global";
const isAuthorized = false

module.exports = [
    {
        method: 'POST',
        path: '/user/signup',
        handler: User.signup,
        options: {
            tags: ["api", "User"],
            notes: "This endpoint registers a new user by accepting their details and sending a verification link to the provided email address.",
            description: "Endpoint for user registration.",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                payload: signupRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/verify-token',
        handler: User.verifyToken,
        options: {
            tags: ["api", "User"],
            notes: "This endpoint allows users to verify if a token is valid or invalid, and if it is active or expired.",
            description: "Verify token",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                payload: verifyTokenRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    // {
    //     method: 'POST',
    //     path: '/user/verify-email',
    //     handler: User.verifyEmail,
    //     options: {
    //         tags: ["api", "User"],
    //         notes: "This endpoint allows users to verify if a token is valid or invalid, and if it is active or expired. If the token is verified, it creates a user based on the information stored within it.",
    //         description: "Verify email",
    //         auth: false,
    //         validate: {
    //             headers: headers,
    //             options: options,
    //             payload: verifyTokenRequest,
    //             failAction: async (request: any, h: any, error: any) => {
    //                 return Common.FailureError(error, request);
    //             },
    //             validator: Joi
    //         },
    //         response: {
    //             status: {
    //                 // 200: userResponse,
    //                 400: resp400,
    //                 500: resp500
    //             }
    //         }
    //     }
    // },
    {
        method: 'POST',
        path: '/user/verify-code',
        handler: User.verifyCode,
        options: {
            tags: ["api", "User"],
            notes: "This endpoint allows users to verify if a token is valid or invalid, and if it is active or expired. If the token is verified, it creates a user based on the information stored within it.",
            description: "Verify email",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                payload: verifyTokenRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: userResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/login',
        handler: User.login,
        options: {
            tags: ["api", "User"],
            notes: "Verifies the User based on email - password and provide the auth token with user details.",
            description: "User Login",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                payload: loginRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: userResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/refresh-token',
        handler: User.refreshToken,
        options: {
            tags: ["api", "User"],
            notes: "Generates new auth token with the help of refresh token",
            description: "Refresh Token",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                payload: refreshTokenRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: userResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/social-login',
        handler: User.socialLogin,
        options: {
            tags: ["api", "User"],
            notes: "Verifies the User based on social account and provide the auth token with user details.",
            description: "Social Login",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                payload: socialLoginRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: userResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/forgot-password',
        handler: User.forgetPassword,
        options: {
            tags: ["api", "User"],
            notes: "Verifies the User based on email and initiates the forgot password process by sending a reset link or code.",
            description: "Forgot password",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                payload: forgetPasswordRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/change-email',
        handler: User.requestChangeEmail,
        options: {
            tags: ["api", "User"],
            notes: "Initiates the process for changing the user's email address. Verifies the user based on JWT authentication and processes the request to update the email.",
            description: "Change Password",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: forgetPasswordRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/change-mobile',
        handler: User.requestChangeMobile,
        options: {
            tags: ["api", "User"],
            notes: "Initiates the process for changing the user's mobile number. Verifies the user based on JWT authentication and processes the request to update the mobile number.",
            description: "Change Mobile",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: changeMobileRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/resend-code',
        handler: User.resendCode,
        options: {
            tags: ["api", "User"],
            notes: "Verifies the User based on email and initiates the forgot password process by sending a reset link or code.",
            description: "Resend Code",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                payload: resendCodeRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/reset-password',
        handler: User.resetPassword,
        options: {
            tags: ["api", "User"],
            notes: "Verifies the User based on email and initiates the forget password process by sending a reset link or code.",
            description: "Reset Password",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                payload: resetPasswordRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: userResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/user/change-password',
        handler: User.changePassword,
        options: {
            tags: ["api", "User"],
            notes: "Allow verified user to change password after loggin in to the application.",
            description: "Change Password",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: changePasswordRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: userResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/users',
        handler: User.userslist,
        options: {
            tags: ["api", "User"],
            notes: "Retrieve a list of users by applying filters such as role and status. Include pagination and support custom sorting options to organize the results accordingly.",
            description: "List Users",
            auth: false,
            // auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                query: fetchUserListRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/user/profile',
        handler: User.usersProfile,
        options: {
            tags: ["api", "User"],
            notes: "To access the details of an authorized user, ensure that the request is accompanied by a valid authentication token.",
            description: "Authorized User Profile",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                //query: fetchUserListRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: userResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/user/{id}',
        handler: User.fetchUser,
        options: {
            tags: ["api", "User"],
            notes: "To list the details of an authorized user, the request must be made on behalf of another user, but only if accompanied by a valid authentication token.",
            description: "User Profile by id",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                params: identifierRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: userResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/create-seller',
        handler: User.createSellerProfile,
        options: {
            tags: ["api", "User"],
            notes: "Allows for the addition of a new seller by providing required details such as name, contact information, and business details.",
            description: "Create Seller from existing buyer",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: createSellerProfileRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/user/update-seller',
        handler: User.updateSellerProfile,
        options: {
            tags: ["api", "User"],
            notes: "Allows for modification of an existing seller's details by providing the seller’s ID and the updated information.",
            description: "Update Seller Profile",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: createSellerProfileRequest,
                // payload: updateSellerProfileRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/user/update-profile',
        handler: User.updateUserProfile,
        options: {
            tags: ["api", "User"],
            notes: "Allows for modification of an existing user's details by providing the updated information.",
            description: "Update User Profile",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: updateUserProfileRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/user/update-settings',
        handler: User.updateUserSettings,
        options: {
            tags: ["api", "User"],
            notes: "User Settings update",
            description: "Update User settings",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: updateUserSettings,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/user/{id}/status',
        handler: User.changeStatus,
        options: {
            tags: ["api", "User"],
            notes: "Allow User to change the status of the account to active/inactive.",
            description: "Change Status",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                params: identifierRequest,
                payload: changeStatusRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/{id}/approve-account',
        handler: User.approveAccount,
        options: {
            tags: ["api", "User"],
            notes: "Allow admin to taken an action on the user's seller account",
            description: "Approve Seller Account",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                params: identifierRequest,
                payload: approveAccountRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/shop-request',
        handler: User.generateShopRequest,
        options: {
            tags: ["api", "User"],
            notes: "Allow user to submit the details required for shop agreement",
            description: "Approve Seller Account",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: createShopDocRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/user/{id}/document-fields',
        handler: User.documentFieldRequest,
        options: {
            tags: ["api", "User"],
            notes: "Enlist the fields of the documents",
            description: "Approve Seller Account",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                params: identifierRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]