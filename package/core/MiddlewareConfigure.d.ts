import { CommonHandler } from "./common.js";
import { Middleware } from "./router.js";
export type DuplicateMiddlewares = Middleware<any>[];
export type UniqueMiddlewares = Set<Middleware<any>>;
export declare class TriMiddleware {
    children: Map<string, TriMiddleware>;
    middlewares: DuplicateMiddlewares | UniqueMiddlewares;
    isOptional: boolean;
    pathname: string;
    constructor(pathname?: string);
}
export default class MiddlewareConfigure<T extends Record<string, any> = {}> extends CommonHandler {
    triMiddlewares: TriMiddleware;
    protected basePath: string;
    constructor(basePath?: string);
    protected addMiddleware(pathname: string, middlewares: Middleware<T>[]): void;
}
