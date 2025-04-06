import { ctx as Context } from "../core/router";
export type CorsOptions = {
  origin?:
    | string
    | RegExp
    | (string | RegExp)[]
    | ((reqOrigin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
};
export declare function cors(
  option?: CorsOptions,
): (ctx: Context, next: () => Promise<any>) => Promise<any>;
