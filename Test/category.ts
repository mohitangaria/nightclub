const adminPayload = {
    email: 'admin@stylette.com',
    password: 'admin@123'
};

const categoryTypePayload = {
    name: 'category_type_' + String(Date.now()),
    description: 'category_type_description_' + String(Date.now())
};

const categoryPayload = {
    name: 'category_' + String(Date.now()),
    categoryTypeCode: ""
};

const defaultLanguage = "en";
const process = [
    {
        entity: 'category',
        title: 'Initialize server in test mode and run necessary seeders',
        method: 'GET',
        url: '/',
        headers: {},
        data: {},
        as: "Server Initialization",
        expectedResponseCode: 200,
        follow: [
            {
                entity: 'category',
                title: 'Admin login with valid credentials',
                method: 'POST',
                url: '/user/login',
                headers: {},
                data: { email: adminPayload.email, password: adminPayload.password },
                as: "Admin Login",
                expectedResponseCode: 200,
                storeVariables: ['token:token'],
                follow: [
                    {
                        entity: 'category',
                        title: 'Category type creation should fail with empty payload',
                        method: 'POST',
                        url: '/category-type',
                        headers: { language: defaultLanguage, authorization: ":token" },
                        data: {},
                        as: "Category Type Creation Failure",
                        expectedResponseCode: 400,
                        failOnStatusCode: false
                    },
                    {
                        entity: 'category',
                        title: 'Category type creation should fail with empty string values',
                        method: 'POST',
                        url: '/category-type',
                        headers: { language: defaultLanguage, authorization: ":token" },
                        data: { name: "", description: "" },
                        as: "Category Type Creation Failure",
                        expectedResponseCode: 400,
                        failOnStatusCode: false
                    },
                    {
                        entity: 'category',
                        title: 'Create a valid category type',
                        method: 'POST',
                        url: '/category-type',
                        headers: { language: defaultLanguage, authorization: ":token" },
                        data: categoryTypePayload,
                        as: "Create Category Type",
                        expectedResponseCode: 200,
                        storeVariables: ['code:category', 'id:id'],
                        follow: [
                            {
                                entity: 'category',
                                title: 'Category type update should fail with empty string values',
                                method: 'PATCH',
                                url: '/category-type/{id}',
                                params: { id: ":id" },
                                headers: { language: defaultLanguage, authorization: ":token" },
                                data: { name: "", description: "" },
                                as: "Category Type Update Failure",
                                expectedResponseCode: 400,
                                failOnStatusCode: false
                            },
                            {
                                entity: 'category',
                                title: 'Category type update should fail with empty payload',
                                method: 'PATCH',
                                url: '/category-type/{id}',
                                params: { id: ":id" },
                                headers: { language: defaultLanguage, authorization: ":token" },
                                data: {},
                                as: "Category Type Update Failure",
                                expectedResponseCode: 400,
                                failOnStatusCode: false
                            },
                            {
                                entity: 'category',
                                title: 'Category type update should fail with invalid attribute',
                                method: 'PATCH',
                                url: '/category-type/{id}',
                                params: { id: ":id" },
                                headers: { language: defaultLanguage, authorization: ":token" },
                                data: { invalidAttribute: "invalidAttribute" },
                                as: "Category Type Update Failure",
                                expectedResponseCode: 400,
                                failOnStatusCode: false
                            },
                            {
                                entity: 'category',
                                title: 'Update category type with valid data',
                                method: 'PATCH',
                                url: '/category-type/{id}',
                                params: { id: ":id" },
                                headers: { language: defaultLanguage, authorization: ":token" },
                                data: categoryTypePayload,
                                as: "Update Category Type",
                                expectedResponseCode: 200
                            },
                            {
                                entity: 'category',
                                title: 'Retrieve list of category types',
                                method: 'GET',
                                url: '/category-types',
                                headers: { language: defaultLanguage, authorization: ":token" },
                                as: "Fetch Category Types",
                                expectedResponseCode: 200
                            },
                            {
                                entity: 'category',
                                title: 'Retrieve category types using alternative URL',
                                method: 'GET',
                                url: '/category-type/list',
                                headers: { language: defaultLanguage, authorization: ":token" },
                                as: "Fetch Category Types",
                                expectedResponseCode: 200
                            },
                            {
                                entity: 'category',
                                title: 'Retrieve specific category type by ID',
                                method: 'GET',
                                url: '/category-type/{id}',
                                params: { id: ":id" },
                                headers: { language: defaultLanguage, authorization: ":token" },
                                as: "Fetch Specific Category Type",
                                expectedResponseCode: 200
                            },
                            {
                                entity: 'category',
                                title: 'Category creation should fail with empty payload',
                                method: 'POST',
                                url: '/category',
                                headers: { language: defaultLanguage, authorization: ":token" },
                                data: {},
                                as: "Category Creation Failure",
                                expectedResponseCode: 400,
                                failOnStatusCode: false
                            },
                            {
                                entity: 'category',
                                title: 'Category creation should fail with empty string values',
                                method: 'POST',
                                url: '/category',
                                headers: { language: defaultLanguage, authorization: ":token" },
                                data: { name: "", categoryTypeCode: "" },
                                as: "Category Creation Failure",
                                expectedResponseCode: 400,
                                failOnStatusCode: false
                            },
                            {
                                entity: 'category',
                                title: 'Create a valid category',
                                method: 'POST',
                                url: '/category',
                                headers: { language: defaultLanguage, authorization: ":token" },
                                data: { ...categoryPayload, categoryTypeCode: ":category" },
                                as: "Create Category",
                                expectedResponseCode: 200,
                                storeVariables: ['id:categoryId'],
                                follow: [
                                    {
                                        entity: 'category',
                                        title: 'Category update should fail with empty string values',
                                        method: 'PATCH',
                                        url: '/category/{id}',
                                        params: { id: ":categoryId" },
                                        headers: { language: defaultLanguage, authorization: ":token" },
                                        data: { name: "", categoryTypeCode: "" },
                                        as: "Category Update Failure",
                                        expectedResponseCode: 400,
                                        failOnStatusCode: false
                                    },
                                    {
                                        entity: 'category',
                                        title: 'Category update should fail with empty payload',
                                        method: 'PATCH',
                                        url: '/category/{id}',
                                        params: { id: ":categoryId" },
                                        headers: { language: defaultLanguage, authorization: ":token" },
                                        data: {},
                                        as: "Category Update Failure",
                                        expectedResponseCode: 400,
                                        failOnStatusCode: false
                                    },
                                    {
                                        entity: 'category',
                                        title: 'Category update should fail with invalid attribute',
                                        method: 'PATCH',
                                        url: '/category/{id}',
                                        params: { id: ":categoryId" },
                                        headers: { language: defaultLanguage, authorization: ":token" },
                                        data: { invalidAttribute: "invalidAttribute" },
                                        as: "Category Update Failure",
                                        expectedResponseCode: 400,
                                        failOnStatusCode: false
                                    },
                                    {
                                        entity: 'category',
                                        title: 'Update category with valid data',
                                        method: 'PATCH',
                                        url: '/category/{id}',
                                        params: { id: ":categoryId" },
                                        headers: { language: defaultLanguage, authorization: ":token" },
                                        data: { ...categoryPayload, categoryTypeCode: ":category" },
                                        as: "Update Category",
                                        expectedResponseCode: 200
                                    },
                                    {
                                        entity: 'category',
                                        title: 'Retrieve specific category type by ID',
                                        method: 'GET',
                                        url: '/categories/{categoryTypeCode}',
                                        params: { categoryTypeCode: ":category" },
                                        headers: { language: defaultLanguage, authorization: ":token" },
                                        as: "Fetch Specific Category Type",
                                        expectedResponseCode: 200
                                    },
                                    {
                                        entity: 'category',
                                        title: 'Retrieve specific category type using alternative URL',
                                        method: 'GET',
                                        url: '/category/list',
                                        qs: { type: ":category" },
                                        headers: { language: defaultLanguage, authorization: ":token" },
                                        as: "Fetch Specific Category Type",
                                        expectedResponseCode: 200
                                    },
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

export { process };
