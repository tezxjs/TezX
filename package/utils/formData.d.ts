import { FormDataOptions } from "../core/request";
export declare function parseJsonBody(req: any): Promise<Record<string, any>>;
export declare function parseTextBody(req: any): Promise<string>;
export declare function parseUrlEncodedBody(req: any): Promise<Record<string, any>>;
export declare function parseMultipartBody(req: any, boundary: string, options?: FormDataOptions): Promise<Record<string, any>>;
