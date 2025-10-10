"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
const error_js_1 = require("../core/error.js");
const colors_js_1 = require("../utils/colors.js");
const runtime_js_1 = require("../utils/runtime.js");
async function parseEnvFile(filePath, result) {
    try {
        if (runtime_js_1.runtime !== "bun") {
            throw new error_js_1.TezXError(`Please use ${(0, colors_js_1.colorText)(`import {loadEnv} from "tezx/${runtime_js_1.runtime}"`, "bgRed")} environment`);
        }
        const fileExists = await Bun.file(filePath).exists();
        if (!fileExists)
            return;
        const fileContent = await Bun.file(filePath).text();
        const lines = fileContent.split("\n");
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith("#"))
                continue;
            const [key, value] = trimmedLine.split("=", 2).map((p) => p.trim());
            if (key && value) {
                const parsedValue = value
                    .replace(/^"(.*)"$/, "$1")
                    .replace(/^'(.*)'$/, "$1");
                result[key] = parsedValue;
                Bun.env[key] = parsedValue;
            }
        }
    }
    catch (error) {
        console.error(`[dotenv] Error parsing file: ${filePath}`, error);
    }
}
async function loadEnv(basePath = "./") {
    const result = {};
    const envFiles = [
        ".env",
        ".env.local",
        `.env.${Bun.env.NODE_ENV || "development"}`,
        `.env.${Bun.env.NODE_ENV || "development"}.local`,
    ];
    for (const envFile of envFiles) {
        await parseEnvFile(`${basePath && basePath.endsWith("/") ? basePath : `${basePath}/`}${envFile}`, result);
    }
    return result;
}
