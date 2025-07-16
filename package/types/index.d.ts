export type DuplicateMiddlewares = Middleware<any>[];
export type UniqueMiddlewares = Set<Middleware<any>>;
export interface CookieOptions {
    expires?: Date;
    path?: string;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
}
export type AdapterType = "bun" | "deno" | "node";
export type ResponseHeaders = Record<string, string>;
import { Context } from "../core/context.js";
export type StaticServeOption = {
    cacheControl?: string;
    headers?: ResponseHeaders;
};
type ExtractParam<Path extends string> = Path extends `${infer _Start}:${infer Param}/${infer Rest}` ? Param extends `${infer Name}?` ? {
    [K in Name]?: string;
} & ExtractParam<`/${Rest}`> : {
    [K in Param]: string;
} & ExtractParam<`/${Rest}`> : Path extends `${infer _Start}:${infer Param}` ? Param extends `${infer Name}?` ? {
    [K in Name]?: string;
} : {
    [K in Param]: string;
} : {};
type ExtractWildcard<Path extends string> = Path extends `${string}*${infer Wildcard}` ? Wildcard extends "" ? {
    "*": string;
} : {
    [K in Wildcard]: string;
} : {};
export type ExtractRouteParams<Path extends string> = ExtractParam<Path> & ExtractWildcard<Path> & Record<string, string>;
export type ExtractParamsFromPath<Path extends PathType> = (Path extends string ? ExtractRouteParams<Path> : {}) & Record<string, string>;
export type NextCallback = () => Promise<any>;
export type CallbackReturn = Promise<Response> | Response;
export type ctx<T extends Record<string, any> = {}, Path extends PathType = any> = Context<T, Path> & T;
export type Callback<T extends Record<string, any> = {}, Path extends PathType = any> = (ctx: ctx<T, Path>) => CallbackReturn;
export type Middleware<T extends Record<string, any> = {}, Path extends PathType = any> = (ctx: ctx<T, Path>, next: NextCallback) => Promise<Response | void> | Response | NextCallback;
export type PathType = string | RegExp;
export type FormDataOptions = {
    maxSize?: number;
    allowedTypes?: string[];
    sanitized?: boolean;
    maxFiles?: number;
};
type TransportType = "tcp" | "udp" | "unix" | "pipe" | "unixpacket";
export type NetAddr = {
    transport?: TransportType;
    family?: "IPv4" | "IPv6" | "Unix";
    address?: string;
    port?: number;
};
export type ConnAddress = {
    remoteAddr: NetAddr;
    localAddr: NetAddr;
};
export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH" | "HEAD" | "ALL" | "TRACE" | "CONNECT" | string;
export {};
