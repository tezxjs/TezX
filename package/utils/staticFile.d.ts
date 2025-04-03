import { Router, StaticServeOption } from "../core/router";
export declare const mimeTypes: {
    [key: string]: string;
};
export declare const defaultMimeType = "application/octet-stream";
export declare function getFiles(dir: string, basePath: string | undefined, ref: Router<any>, option: StaticServeOption): Promise<{
    file: string;
    path: string;
}[]>;
