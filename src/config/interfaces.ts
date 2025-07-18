import {RouteType} from "../config/customTypes"



//User template interfaces

interface UserInterface {
    id?: number;
    email: string | null;
    countryCode?:string;
    mobile:string | null;
    password:string | null;
    status:number | null;
    userProfile?:UserProfileInterface,
    Roles?:RoleInterface[],
    createdAt?:Date,
    updatedAt?:Date,
}

interface UserAccount{
    id?: number;
    userId?: number;
    accountId:number | null;
    isDefault:boolean;
   
}
interface UserProfileInterface{
    // Some fields are optional when calling UserModel.create() or UserModel.build()
    id?: number;
    userId?: number;
    name?:string;
    imageId?:number | null;
}



interface TokenInterface{
    id?: number;
    type: string;
    email: string | null;
    username: string | null;
    countryCode:string | null;
    mobile: string | null;
    userId: number | null;
    accountId: number | null;
    token: string;
    code?: string;
    status: number;
    verificationsAttempts:number;
    createdAt?: Date | null;
    updatedAt?: Date | null;

}
// Role Interface 
interface RoleInterface{
    id: number;
    code: string;
    userId:number;
    lastUpdatedBy:number
    accountId:number;
    isRevision:boolean;
    revisionId:number;
    isDefault:boolean;
    status:number;
    Permissions?:Permission[]
}

// Roles contents

interface RoleContent{
    id: number;
    roleId: number;
    languageId:number;
    name:string;
 
}

// Permission
interface Permission{
    id: number;
    userId: number;
    accountId:number;
    lastUpdatedBy:number;
    code:string;
    adminOnly:boolean;
    isRevision:boolean;
    revisionId:number;
    status:number;
}



//attachments

interface Attachment{
    id?: number;
    fileName: string;
    userId:number;
    accountId:number;
    extension:string;
    uniqueName:string;
    filePath:string;
    type:number;
    size:number;
    dataKey?:Text | null;
    status:number;
}



// Language

interface Language{
    id: number;
    name: String;
    code:String;
    isDefault:number;
    status:number;

}

//Category 

interface CategoryInterface{
    id?: number;
    code: string;
    categorytypeId:number;
    parentId: number|null;
    userId:number|null;
    accountId: number|null;
    adminOnly?:Boolean;
    lastUpdatedBy:number | null;
    isRevision?:boolean;
    imageId:number|null;
    revisionId?:number|null;
    orderSequence?:string;
    level?:number;
    status?:number;
    parent?:{
        id:number,
        code:string,
        name:string
    }
    CategoryContents?:CategoryContentInterface[]
    CategoryType?:CategoryTypeInterface
}


interface CategoryContentInterface{
    id?: number;
    categoryId?:number;
    languageId: number;
    name:string;
  
}

interface CategoryTypeInterface{
    id?: number;
    code: string;
    userId:number;
    lastUpdatedBy:number;
    isRevision?:Boolean;
    revisionId?:number;
    status:number;
    CategorytypeContents?:CategoryTypeContentInterface[];
}

interface CategoryTypeContentInterface {
    id?: number;
    categorytypeId?: number;
    languageId: number;
    name:string;
    description:string;
    descriptionText:string;
}


// AppVersion

interface AppVersionInterface{
    id?:number;
    userId?:number;
    ios_soft_update?:string;
    ios_critical_update?:number;
    android_soft_update?:number;
    android_critical_update?:number;
}

interface PermissionContent{
    id: number;
    permissionId: number;
    languageId:number;
    name:Text;
    description:Text;
}







export { 
    PermissionContent,
    UserInterface, 
    UserAccount,
    UserProfileInterface,
    AppVersionInterface,
    TokenInterface,
    RoleInterface,
    RoleContent,
    Permission,
    Attachment,
    Language,
    RouteType,
    CategoryInterface,
    CategoryContentInterface,
    CategoryTypeInterface,
    CategoryTypeContentInterface,
}