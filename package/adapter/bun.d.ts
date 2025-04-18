import { TezX } from "../core/server.js";
export declare function bunAdapter<T extends Record<string, any> = {}>(TezX: TezX<T>): {
    listen: (port: number, callback?: (message: string) => void) => any;
};
