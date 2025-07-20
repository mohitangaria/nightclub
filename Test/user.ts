const randomEmail='email_1'+String(Date.now())+'@domain.com';
const adminPayload = {
    email: 'admin@stylette.com',
    password: 'admin@123'
}

const createUser = {
    email: "stylette_user@yopmail.com",
    password: "password"
}

const randomUser = {
    email: 'email_'+String(Date.now())+'@domain.com',
    password: "password",
    userName: 'user '+String(Date.now())
}

const changeUserDataUser = {
    email: 'email001_'+String(Date.now())+'@domain.com',
    password: "password",
    userName: 'user '+String(Date.now())
}

const changeSellerDataUser = {
    email: 'email_seller_'+String(Date.now())+'@domain.com',
    password: "password",
    userName: 'seller '+String(Date.now())
}

const sellerUpdatePayload = {  
    name: "John Doe",
    contactEmail: "john.doe@example.com",
    contactCountryCode: "+1",
    contactPhone: "1234567890",
    storeUrl: "https://www.example.com",
    socialMediaLink: "https://www.twitter.com/johndoe"
}


const process=[
    {
        entity:'user',
        title:'Start server in test mode and execute required seeders',
        method:'GET',
        url:'/',
        headers:{},
        data:{},
        as:"Server initiation",
        expectedResponseCode:200,
        follow:[
            {
                entity:'user',
                title:'Login attempt with empty payload should return an error',
                method:'POST',
                url:'/user/login',
                headers:{},
                data:{},
                as:"Login Request",
                expectedResponseCode:400,
                failOnStatusCode: false
            },
            {
                entity:'user',
                title:'Login attempt with only email in payload should return an error',
                method:'POST',
                url:'/user/login',
                headers:{},
                data:{email: adminPayload.email},
                as:"Login Request",
                expectedResponseCode:400,
                failOnStatusCode: false
            },
            {
                entity:'user',
                title:'Login attempt with only passord in payload should return an error',
                method:'POST',
                url:'/user/login',
                headers:{},
                data:{password: adminPayload.password},
                as:"Login Request",
                expectedResponseCode:400,
                failOnStatusCode: false
            },
            {
                entity:'user',
                title:'Login attempt with empty string email and password in payload should return an error',
                method:'POST',
                url:'/user/login',
                headers:{},
                data:{email: "", password: ""},
                as:"Login Request",
                expectedResponseCode:400,
                failOnStatusCode: false
            },
            {
                entity:'user',
                title:'Login attempt valid payload should not return an error',
                method:'POST',
                url:'/user/login',
                headers:{},
                data:{email: adminPayload.email, password: adminPayload.password},
                as:"Login Request",
                expectedResponseCode:200
            },
            {
                entity:'user',
                title:'signup attempt with empty payload should return an error',
                method:'POST',
                url:'/user/signup',
                headers:{},
                data:{},
                as:"Signup Request",
                expectedResponseCode:400,
                failOnStatusCode: false
            },
            {
                entity:'user',
                title:'signup attempt with empty string in all the values in payload should return an error',
                method:'POST',
                url:'/user/signup',
                headers:{},
                data:{name: "", email: "", password: "", role: ""},
                as:"Signup Request",
                expectedResponseCode:400,
                failOnStatusCode: false
            },
            {
                entity:'user',
                title:'signup attempt with missing keys in payload should return an error',
                method:'POST',
                url:'/user/signup',
                headers:{},
                data:{name: "name", email: createUser.email},
                as:"Signup Request",
                expectedResponseCode:400,
                failOnStatusCode: false
            },
            {
                entity:'user',
                title:'signup attempt with invalid attribute in payload should return an error',
                method:'POST',
                url:'/user/signup',
                headers:{},
                data:{invalidAttribute: "invalidAttribute"},
                as:"Signup Request",
                expectedResponseCode:400,
                failOnStatusCode: false
            },
            {
                entity:'user',
                title:'signup attempt with valid payload of random user should not return an error',
                method:'POST',
                url:'/user/signup',
                headers:{},
                data:{name: randomUser.userName, email: randomUser.email, password: randomUser.password, role: "user"},
                as:"Signup Request",
                expectedResponseCode:200,
                storeVariables: ['token:token'],
                follow: [
                    {
                        entity:'user',
                        title:'verify email attempt with empty payload should return an error',
                        method:'POST',
                        url:'/user/verify-email',
                        headers:{},
                        data:{},
                        as:"Signup Request",
                        expectedResponseCode:400,
                        failOnStatusCode: false
                    },
                    {
                        entity:'user',
                        title:'verify email attempt with empty string payload should return an error',
                        method:'POST',
                        url:'/user/verify-email',
                        headers:{},
                        data:{token: "", code: ""},
                        as:"Signup Request",
                        expectedResponseCode:400,
                        failOnStatusCode: false
                    },
                    {
                        entity:'user',
                        title:'verify email attempt with invalid attribute in payload should return an error',
                        method:'POST',
                        url:'/user/verify-email',
                        headers:{},
                        data:{invalid: "attribute"},
                        as:"Signup Request",
                        expectedResponseCode:400,
                        failOnStatusCode: false
                    },
                    {
                        entity:'user',
                        title:'verify email attempt with invalid payload should return an error',
                        method:'POST',
                        url:'/user/verify-email',
                        headers:{},
                        data:{token: "invalid_token", code: "invalid_code"},
                        as:"Signup Request",
                        expectedResponseCode:400,
                        failOnStatusCode: false
                    },
                    {
                        entity:'user',
                        title:'verify email attempt with valid payload should not return an error',
                        method:'POST',
                        url:'/user/verify-email',
                        headers:{},
                        data:{token: ":token", code: "9999"},
                        as:"Signup Request",
                        expectedResponseCode:200
                    },
                    {
                        entity:'user',
                        title:'verify email attempt used token should return an error',
                        method:'POST',
                        url:'/user/verify-email',
                        headers:{},
                        data:{token: ":token", code: "9999"},
                        as:"Signup Request",
                        expectedResponseCode:400,
                        failOnStatusCode: false
                    }
                ]
            },
            {
                entity:'user',
                title:'signup attempt with valid payload of known user for forget passowrd should not return an error',
                method:'POST',
                url:'/user/signup',
                headers:{},
                data:{name: "known user", email: changeUserDataUser.email, password: changeUserDataUser.password, role: "user"},
                as:"Signup Request",
                expectedResponseCode:200,
                storeVariables: ['token:token'],
                follow: [
                    {
                        entity:'user',
                        title:'verify email attempt with valid payload should not return an error',
                        method:'POST',
                        url:'/user/verify-email',
                        headers:{},
                        data:{token: ":token", code: "9999"},
                        as:"Signup Request",
                        expectedResponseCode:200,
                        storeVariables: ['token:authToken'],
                        follow: [
                            {
                                entity:'user',
                                title:'Forget Password for user using unregistered email',
                                method:'POST',
                                url:'/user/forgot-password',
                                headers:{},
                                data:{'email': randomEmail},
                                as:"Forgot Password Request",
                                expectedResponseCode:400,
                                failOnStatusCode: false
                            },
                            {
                                entity:'user',
                                title:'Forget Password for user using registered email',
                                method:'POST',
                                url:'/user/forgot-password',
                                headers:{},
                                data:{'email': randomUser.email},
                                as:"Forgot Password Request",
                                expectedResponseCode:200,
                                storeVariables: ['token:forgotPasswordToken'],
                                follow: [
                                    {
                                        entity:'user',
                                        title:'Verify request for forgot password with valid payload should not retuen error',
                                        method:'POST',
                                        url:'/user/reset-password',
                                        headers:{},
                                        data:{token:":forgotPasswordToken",code:'9999',password:"testpassword"},
                                        as:"Reset Password Request",
                                        expectedResponseCode:200,
                                        // follow: [
                                        //     {
                                        //         entity:'user',
                                        //         title:'Change Password for user using registered email',
                                        //         method:'PATCH',
                                        //         url:'/user/change-password',
                                        //         headers:{authorization: ":authToken"},
                                        //         data:{oldPassword: "testpassword", password: "password"},
                                        //         as:"Forgot Password Request",
                                        //         expectedResponseCode:200
                                        //     },
                                        // ]
                                    }
                                ]
                            },
                            {
                                entity:'user',
                                title:'Change email for user using registered email',
                                method:'POST',
                                url:'/user/change-email',
                                headers:{authorization: ":authToken"},
                                data:{email: "changed_"+randomUser.email},
                                as:"Change Email Request",
                                expectedResponseCode:200,
                                storeVariables: ['token:changeEmailToken'],
                                follow: [
                                    {
                                        entity:'user',
                                        title:'verify email attempt with valid payload should not return an error',
                                        method:'POST',
                                        url:'/user/verify-email',
                                        headers:{},
                                        data:{token: ":changeEmailToken", code: "9999"},
                                        as:"Verify Email Request",
                                        expectedResponseCode:200
                                    }
                                ]
                            },
                        ]
                    }
                ]
            },
            {
                entity:'user',
                title:'signup attempt with valid payload of random user should not return an error',
                method:'POST',
                url:'/user/signup',
                headers:{},
                data:{name: changeSellerDataUser.userName, email: changeSellerDataUser.email, password: changeSellerDataUser.password, role: "seller"},
                as:"Signup Request",
                expectedResponseCode:200,
                storeVariables: ['token:token'],
                follow: [
                    {
                        entity:'user',
                        title:'verify email attempt with valid payload should not return an error',
                        method:'POST',
                        url:'/user/verify-email',
                        headers:{},
                        data:{token: ":token", code: "9999"},
                        as:"Signup Request",
                        expectedResponseCode:200,
                        storeVariables: ['token:authToken'],
                        follow: [
                            {
                                entity:'user',
                                title:'update seller with empty payload should return an error',
                                method:'PATCH',
                                url:'/user/update-seller',
                                headers:{authorization: ":authToken"},
                                data:{},
                                as:"Signup Request",
                                expectedResponseCode:400,
                                failOnStatusCode: false
                            },
                            {
                                entity:'user',
                                title:'update seller with valid payload should not return an error',
                                method:'PATCH',
                                url:'/user/update-seller',
                                headers:{authorization: ":authToken"},
                                data: sellerUpdatePayload,
                                as:"Signup Request",
                                expectedResponseCode:200
                            }
                        ]
                    }
                ]
            },
        ]
    }
]

export {process}