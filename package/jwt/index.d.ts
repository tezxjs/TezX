export type Alg = "HS1" | "HS256" | "HS384" | "HS512";
/** Sign payload and return JWT (async) */
export declare function sign(payload: Record<string, any>, opts?: {
    secret?: string;
    algorithm?: Alg;
    expiresIn?: string | number;
}): Promise<string>;
/** Verify JWT, return payload or null */
export declare function verify(token: string, secret?: string): Promise<Record<string, any> | null>;
declare const _default: {
    sign: typeof sign;
    verify: typeof verify;
};
export default _default;
