import { HandlerType, HTTPMethod, RouteMatchResult, RouteRegistry } from "../types/index.js";
export declare class CombineRouteRegistry<T> implements RouteRegistry {
    name: string;
    private root;
    x: any;
    constructor();
    private createNode;
    addMiddleware(path: string, middleware: Function[]): void;
    addRoute(method: string, path: string, handler: HandlerType): void;
    search(method: HTTPMethod, path: string): RouteMatchResult;
}
