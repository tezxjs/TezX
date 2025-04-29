import { TezX } from "../core/server.js";
export declare function denoAdapter<T extends Record<string, any> = {}>(TezX: TezX<T>, options?: Deno.ServeUnixOptions | Deno.ServeTcpOptions | (Deno.ServeTcpOptions & Deno.TlsCertifiedKeyPem)): {
    listen: {
        (callback?: (message: string) => void): any;
        (port?: number): any;
        (port?: number, callback?: (message: string) => void): any;
    };
};
