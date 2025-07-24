const adminPayload = {
    email: 'admin@nightCode.com',
    password: 'admin@123'
};

const blogCategoryTypePayload = {
    name: 'blogs_' + String(Date.now()),
    description: 'category_type_description_for_blog'
};

const faqCategoryTypePayload = {
    name: 'faqs_' + String(Date.now()),
    description: 'category_type_description_for_faqs'
};

const blogCategoryPayload = {
    name: 'category_blog_' + String(Date.now()),
    categoryTypeCode: ""
};

const faqCategoryPayload = {
    name: 'category_faq_' + String(Date.now()),
    categoryTypeCode: ""
};

const blogPayload = {
    title: "Post_title_" + String(Date.now()),
    description: "Post description",
    excerpt: "Post excerpt",
    postType: "post",
    categoryId: ""
}

const faqPayload = {
    question: "Faq_Question_" + String(Date.now()),
    answer: "Faq_answer",
    categoryId: ""
}

const defaultLanguage = "en";
const process = [
    {
        entity: 'cms',
        title: 'Initialize server in test mode and run seeders',
        method: 'GET',
        url: '/',
        headers: {},
        data: {},
        as: "Server Initialization",
        expectedResponseCode: 200,
        follow: [
            {
                entity: 'cms',
                title: 'Admin login using valid credentials',
                method: 'POST',
                url: '/user/login',
                headers: {},
                data: { email: adminPayload.email, password: adminPayload.password },
                as: "Admin Login",
                expectedResponseCode: 200,
                storeVariables: ['token:token'],
                follow: [
                    {
                        entity: 'cms',
                        title: 'Create a blog category type',
                        method: 'POST',
                        url: '/category-type',
                        headers: { language: defaultLanguage, authorization: ":token" },
                        data: blogCategoryTypePayload,
                        as: "Create Blog Category Type",
                        expectedResponseCode: 200,
                        storeVariables: ['code:categoryCode'],
                        follow: [
                            {
                                entity: 'cms',
                                title: 'Create a blog category',
                                method: 'POST',
                                url: '/category',
                                headers: { language: defaultLanguage, authorization: ":token" },
                                data: {...blogCategoryPayload, categoryTypeCode: ":categoryCode"},
                                as: "Create Blog Category",
                                expectedResponseCode: 200,
                                storeVariables: ['id:categoryId'],
                                follow: [
                                    {
                                        entity: 'cms',
                                        title: 'Create a post with empty string values (Expected to fail)',
                                        method: 'POST',
                                        url: '/post',
                                        data: { title: "", description: "", excerpt: "", postType: "", categoryId: "" },
                                        headers: { language: defaultLanguage, authorization: ":token" },
                                        as: "Post Creation Failure (Empty Strings)",
                                        expectedResponseCode: 400,
                                        failOnStatusCode: false
                                    },
                                    {
                                        entity: 'cms',
                                        title: 'Create a post with an empty payload (Expected to fail)',
                                        method: 'POST',
                                        url: '/post',
                                        headers: { language: defaultLanguage, authorization: ":token" },
                                        data: {},
                                        as: "Post Creation Failure (Empty Payload)",
                                        expectedResponseCode: 400,
                                        failOnStatusCode: false
                                    },
                                    {
                                        entity: 'cms',
                                        title: 'Create a post with an invalid attribute (Expected to fail)',
                                        method: 'POST',
                                        url: '/post',
                                        headers: { language: defaultLanguage, authorization: ":token" },
                                        data: { invalidAttribute: "invalidAttribute" },
                                        as: "Post Creation Failure (Invalid Attribute)",
                                        expectedResponseCode: 400,
                                        failOnStatusCode: false
                                    },
                                    {
                                        entity: 'cms',
                                        title: 'Create a valid post under the blog category',
                                        method: 'POST',
                                        url: '/post',
                                        headers: { language: defaultLanguage, authorization: ":token" },
                                        data: {...blogPayload, categoryId: ":categoryId"},
                                        as: "Create Post",
                                        expectedResponseCode: 200,
                                        storeVariables: ['id:postId'],
                                        follow: [
                                            {
                                                entity: 'cms',
                                                title: 'Update post with an invalid attribute (Expected to fail)',
                                                method: 'PATCH',
                                                url: '/post/{id}',
                                                params: { id: ":postId" },
                                                headers: { language: defaultLanguage, authorization: ":token" },
                                                data: { invalidAttribute: "invalidAttribute" },
                                                as: "Post Update Failure (Invalid Attribute)",
                                                expectedResponseCode: 400,
                                                failOnStatusCode: false
                                            },
                                            {
                                                entity: 'cms',
                                                title: 'Update post with an empty payload (Expected to fail)',
                                                method: 'PATCH',
                                                url: '/post/{id}',
                                                params: { id: ":postId" },
                                                headers: { language: defaultLanguage, authorization: ":token" },
                                                data: {},
                                                as: "Post Update Failure (Empty Payload)",
                                                expectedResponseCode: 400,
                                                failOnStatusCode: false
                                            },
                                            {
                                                entity: 'cms',
                                                title: 'Update post with empty string values (Expected to fail)',
                                                method: 'PATCH',
                                                url: '/post/{id}',
                                                params: { id: ":postId" },
                                                headers: { language: defaultLanguage, authorization: ":token" },
                                                data: { title: "", description: "", excerpt: "", postType: "", categoryId: "" },
                                                as: "Post Update Failure (Empty Strings)",
                                                expectedResponseCode: 400,
                                                failOnStatusCode: false
                                            },
                                            {
                                                entity: 'cms',
                                                title: 'Update post with valid data',
                                                method: 'PATCH',
                                                url: '/post/{id}',
                                                params: { id: ":postId" },
                                                headers: { language: defaultLanguage, authorization: ":token" },
                                                data: {...blogPayload, categoryId: ":categoryId"},
                                                as: "Update Post",
                                                expectedResponseCode: 200
                                            },
                                            {
                                                entity: 'cms',
                                                title: 'Retrieve the updated post',
                                                method: 'GET',
                                                url: '/post/{id}',
                                                params: { id: ":postId" },
                                                headers: { language: defaultLanguage, authorization: ":token" },
                                                as: "Get Updated Post",
                                                expectedResponseCode: 200
                                            },
                                            {
                                                entity: 'cms',
                                                title: 'List all posts',
                                                method: 'GET',
                                                url: '/post/list',
                                                headers: { language: defaultLanguage, authorization: ":token" },
                                                as: "List All Posts",
                                                expectedResponseCode: 200
                                            },
                                            {
                                                entity: 'cms',
                                                title: 'Retrieve public posts',
                                                method: 'GET',
                                                url: '/post/public-list',
                                                as: "List Public Posts",
                                                expectedResponseCode: 200
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        entity: 'cms',
                        title: 'Create a FAQ category type',
                        method: 'POST',
                        url: '/category-type',
                        headers: { language: defaultLanguage, authorization: ":token" },
                        data: faqCategoryTypePayload,
                        as: "Create FAQ Category Type",
                        expectedResponseCode: 200,
                        storeVariables: ['code:categoryCode'],
                        follow: [
                            {
                                entity: 'cms',
                                title: 'Create a FAQ category',
                                method: 'POST',
                                url: '/category',
                                headers: { language: defaultLanguage, authorization: ":token" },
                                data: { ...faqCategoryPayload, categoryTypeCode: ":categoryCode" },
                                as: "Create FAQ Category",
                                expectedResponseCode: 200,
                                storeVariables: ['id:categoryId'],
                                follow: [
                                    {
                                        entity: 'cms',
                                        title: 'Create a FAQ with empty string values (Expected to fail)',
                                        method: 'POST',
                                        url: '/faq',
                                        data: { question: "", answer: "", categoryId: "" },
                                        headers: { language: defaultLanguage, authorization: ":token" },
                                        as: "FAQ Creation Failure (Empty Strings)",
                                        expectedResponseCode: 400,
                                        failOnStatusCode: false
                                    },
                                    {
                                        entity: 'cms',
                                        title: 'Create a FAQ with an empty payload (Expected to fail)',
                                        method: 'POST',
                                        url: '/faq',
                                        headers: { language: defaultLanguage, authorization: ":token" },
                                        data: {},
                                        as: "FAQ Creation Failure (Empty Payload)",
                                        expectedResponseCode: 400,
                                        failOnStatusCode: false
                                    },
                                    {
                                        entity: 'cms',
                                        title: 'Create a FAQ with an invalid attribute (Expected to fail)',
                                        method: 'POST',
                                        url: '/faq',
                                        headers: { language: defaultLanguage, authorization: ":token" },
                                        data: { invalidAttribute: "invalidAttribute" },
                                        as: "FAQ Creation Failure (Invalid Attribute)",
                                        expectedResponseCode: 400,
                                        failOnStatusCode: false
                                    },
                                    {
                                        entity: 'cms',
                                        title: 'Create a valid FAQ under the FAQ category',
                                        method: 'POST',
                                        url: '/faq',
                                        headers: { language: defaultLanguage, authorization: ":token" },
                                        data: { ...faqPayload, categoryId: ":categoryId" },
                                        as: "Create FAQ",
                                        expectedResponseCode: 200,
                                        storeVariables: ['id:faqId'],
                                        follow: [
                                            {
                                                entity: 'cms',
                                                title: 'Update FAQ with an invalid attribute (Expected to fail)',
                                                method: 'PATCH',
                                                url: '/faq/{id}',
                                                params: { id: ":faqId" },
                                                headers: { language: defaultLanguage, authorization: ":token" },
                                                data: { invalidAttribute: "invalidAttribute" },
                                                as: "FAQ Update Failure (Invalid Attribute)",
                                                expectedResponseCode: 400,
                                                failOnStatusCode: false
                                            },
                                            {
                                                entity: 'cms',
                                                title: 'Update FAQ with an empty payload (Expected to fail)',
                                                method: 'PATCH',
                                                url: '/faq/{id}',
                                                params: { id: ":faqId" },
                                                headers: { language: defaultLanguage, authorization: ":token" },
                                                data: {},
                                                as: "FAQ Update Failure (Empty Payload)",
                                                expectedResponseCode: 400,
                                                failOnStatusCode: false
                                            },
                                            {
                                                entity: 'cms',
                                                title: 'Update FAQ with empty string values (Expected to fail)',
                                                method: 'PATCH',
                                                url: '/faq/{id}',
                                                params: { id: ":faqId" },
                                                headers: { language: defaultLanguage, authorization: ":token" },
                                                data: { question: "", answer: "", categoryId: "" },
                                                as: "FAQ Update Failure (Empty Strings)",
                                                expectedResponseCode: 400,
                                                failOnStatusCode: false
                                            },
                                            {
                                                entity: 'cms',
                                                title: 'Update FAQ with valid data',
                                                method: 'PATCH',
                                                url: '/faq/{id}',
                                                params: { id: ":faqId" },
                                                headers: { language: defaultLanguage, authorization: ":token" },
                                                data: { ...faqPayload, categoryId: ":categoryId" },
                                                as: "Update FAQ",
                                                expectedResponseCode: 200
                                            },
                                            {
                                                entity: 'cms',
                                                title: 'Retrieve the updated FAQ',
                                                method: 'GET',
                                                url: '/faq/{id}',
                                                params: { id: ":faqId" },
                                                headers: { language: defaultLanguage, authorization: ":token" },
                                                as: "Get Updated FAQ",
                                                expectedResponseCode: 200
                                            },
                                            {
                                                entity: 'cms',
                                                title: 'List all FAQs',
                                                method: 'GET',
                                                url: '/faq/list',
                                                headers: { language: defaultLanguage, authorization: ":token" },
                                                as: "List All FAQs",
                                                expectedResponseCode: 200
                                            }
                                        ]
                                    }
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
