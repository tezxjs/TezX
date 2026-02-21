import { useFormData } from "./formData.js";
import { generateID, generateRandomBase64, generateUUID } from "./generateID.js";
export { useFormData, generateID, generateRandomBase64, generateUUID };
export default {
    useFormData,
    generateID, generateRandomBase64, generateUUID
};
export function getConnInfo(ctx) {
    return ctx?.server?.requestIP?.(ctx.rawRequest);
}
