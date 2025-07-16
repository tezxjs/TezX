import { DuplicateMiddlewares, Middleware, UniqueMiddlewares } from "../types/index.js";
import { CommonHandler } from "./common.js";
export declare class TriMiddleware {
    children: Map<string, TriMiddleware>;
    middlewares: DuplicateMiddlewares | UniqueMiddlewares;
    isOptional: boolean;
    pathname: string;
    constructor(pathname?: string);
}
export default class MiddlewareConfigure<T extends Record<string, any> = {}> extends CommonHandler {
    protected triMiddlewares: TriMiddleware;
    protected basePath: string;
    constructor(basePath?: string);
    protected addMiddleware(pathname: string, middlewares: Middleware<T>[]): void;
}
