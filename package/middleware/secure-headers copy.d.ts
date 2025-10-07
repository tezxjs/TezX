export type SecureHeadersOptions = {
    preset?: "strict" | "balanced" | "dev";
    hsts?: boolean;
    hstsMaxAge?: number;
    frameGuard?: "DENY" | "SAMEORIGIN" | string;
    noSniff?: boolean;
    xssProtection?: boolean;
    referrerPolicy?: string;
    permissionsPolicy?: string;
    csp?: string | Record<string, string | string[]>;
    cspReportOnly?: boolean;
    cspUseNonce?: boolean;
    ultraFastMode?: boolean;
};
export declare const secureHeaders: <T extends Record<string, any> = {}, Path extends string = any>(userOpts?: SecureHeadersOptions) => (ctx: any, next: () => Promise<any>) => Promise<any>;
