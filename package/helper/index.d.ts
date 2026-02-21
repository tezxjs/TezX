import { Ctx, NetAddr } from "../types/index.js";
import { useFormData } from "./formData.js";
import { generateID, generateRandomBase64, generateUUID } from "./generateID.js";
export { useFormData, generateID, generateRandomBase64, generateUUID };
declare const _default: {
    useFormData: typeof useFormData;
    generateID: typeof generateID;
    generateRandomBase64: typeof generateRandomBase64;
    generateUUID: typeof generateUUID;
};
export default _default;
/**
 * Retrieves remote connection details of the client from the Bun server context.
 *
 * This function returns network address information such as transport protocol,
 * address family, IP/hostname, and port.
 *
 * @param {Ctx} ctx - The request context containing the Bun server and raw request.
 * @returns {NetAddr} Object containing client connection details.
 *
 * @example
 * const conn = getConnInfo(ctx);
 * console.log(conn.address, conn.port);
 */
export declare function getConnInfo(ctx: Ctx): NetAddr;
