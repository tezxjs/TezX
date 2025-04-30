import type { ServerOptions } from "node:http";
import type { TlsOptions } from "node:tls";
import { TezX } from "../core/server.js";
type UnixSocketOptions = ServerOptions & {
    unix?: string;
    enableSSL?: false;
};
type SSLOptions = ServerOptions & TlsOptions & {
    enableSSL: true;
};
type TezXServerOptions = UnixSocketOptions | SSLOptions;
export declare function nodeAdapter<T extends Record<string, any> = {}>(TezX: TezX<T>, options?: TezXServerOptions): {
    listen: {
        (callback?: () => void): any;
        (port?: number): any;
        (port?: number, callback?: () => void): any;
    };
};
export {};
