import { GlobalConfig } from "../core/config.js";
import { Environment } from "../core/environment.js";
import { colorText } from "../utils/colors.js";
import { sanitizePathSplit } from "../utils/url.js";
import { generateID } from "./common.js";
export { colorText, Environment, generateID, GlobalConfig, sanitizePathSplit };
export default {
    Environment,
    colorText,
    GlobalConfig,
    sanitizePathSplit,
    generateID,
};
