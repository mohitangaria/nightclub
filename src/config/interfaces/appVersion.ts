// App version interface used by AppVersion model
interface AppVersionInterface {
    id?: number;
    userId?: number;
    ios_soft_update?: string;
    ios_critical_update?: number;
    android_soft_update?: number;
    android_critical_update?: number;
}

export { AppVersionInterface }