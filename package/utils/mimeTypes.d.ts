import { Router } from "../core/router.js";
import { StaticServeOption } from "../types/index.js";
export declare const mimeTypes: {
    [key: string]: string;
};
export declare const defaultMimeType = "application/octet-stream";
export declare function getFiles(dir: string, basePath: string | undefined, ref: Router<any>, option: StaticServeOption): {
    file: string;
    path: string;
}[];
