import { TezXError } from "../core/error.js";
import { colorText } from "../utils/colors.js";
import { runtime } from "../utils/runtime.js";
async function parseEnvFile(filePath, result) {
    try {
        if (runtime !== "bun") {
            throw new TezXError(`Please use ${colorText(`import {loadEnv} from "tezx/${runtime}"`, "bgRed")} environment`);
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
export async function loadEnv(basePath = "./") {
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
