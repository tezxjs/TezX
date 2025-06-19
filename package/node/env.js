import { existsSync, readFileSync } from "node:fs";
import { Environment } from "../core/environment.js";
import { COLORS } from "../utils/colors.js";
function parseEnvFile(filePath, result) {
    try {
        let runtime = Environment.getEnvironment;
        if (runtime !== "bun" && runtime !== "node") {
            throw new Error(`Please use ${COLORS.bgRed}import {loadEnv} from "tezx/${runtime}"${COLORS.reset} environment`);
        }
        let fileExists = existsSync(filePath);
        if (!fileExists) {
            return;
        }
        let fileContent = "";
        fileContent = readFileSync(filePath, "utf8");
        const lines = fileContent.split("\n");
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith("#"))
                continue;
            const [key, value] = trimmedLine.split("=", 2).map((part) => part.trim());
            if (key && value) {
                const parsedValue = value
                    .replace(/^"(.*)"$/, "$1")
                    .replace(/^'(.*)'$/, "$1");
                result[key] = parsedValue;
                process.env[key] = parsedValue;
            }
        }
    }
    catch (error) {
        console.error(`[dotenv] Error parsing file: ${filePath}`, error);
    }
}
export function loadEnv(basePath = "./") {
    const result = {};
    const envFiles = [
        ".env",
        ".env.local",
        `.env.${process?.env?.NODE_ENV || "development"}`,
        `.env.${process?.env?.NODE_ENV || "development"}.local`,
    ];
    for (const envFile of envFiles) {
        parseEnvFile(`${basePath}${envFile}`, result);
    }
    return result;
}
