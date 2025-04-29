import { TezX } from "../core/server.js";
export declare function denoAdapter<T extends Record<string, any> = {}>(
  TezX: TezX<T>,
): {
  listen: (port: number, callback?: (message: string) => void) => any;
};
