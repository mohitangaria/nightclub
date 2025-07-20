// Role inteface
interface RoleInterface {
    id: number;
    code: string;
    userId: number;
    lastUpdatedBy: number
    accountId: number;
    isRevision: boolean;
    revisionId: number;
    isDefault: boolean;
    status: number;
    Permissions?: Permission[]
}

interface RoleContent {
    id: number;
    roleId: number;
    languageId: number;
    name: string;

}

interface Permission {
    id: number;
    userId: number;
    accountId: number;
    lastUpdatedBy: number;
    code: string;
    adminOnly: boolean;
    isRevision: boolean;
    revisionId: number;
    status: number;
}

interface PermissionContent {
    id: number;
    permissionId: number;
    languageId: number;
    name: Text;
    description: Text;
}

export { RoleInterface, RoleContent, Permission, PermissionContent }