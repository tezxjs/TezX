import { TezX } from "./server";
export declare function denoAdapter<T extends Record<string, any> = {}>(TezX: TezX<T>): {
    listen: (port: number, callback?: (message: string) => void) => any;
};
export declare function bunAdapter<T extends Record<string, any> = {}>(TezX: TezX<T>): {
    listen: (port: number, callback?: (message: string) => void) => any;
};
export declare function nodeAdapter<T extends Record<string, any> = {}>(TezX: TezX<T>): {
    listen: (port: number, callback?: (message: string) => void) => void;
};
