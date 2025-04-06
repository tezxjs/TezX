"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
const environment_1 = require("../core/environment");
function parseEnvFile(filePath, result) {
    try {
        let fileExists = false;
        let runtime = environment_1.EnvironmentDetector.getEnvironment;
        if (runtime === "node" || runtime === "bun") {
            const { existsSync } = require("fs");
            fileExists = existsSync(filePath);
        }
        else if (runtime === "deno") {
            try {
                Deno.statSync(filePath);
                fileExists = true;
            }
            catch {
                fileExists = false;
            }
        }
        if (!fileExists) {
            return;
        }
        let fileContent = "";
        if (runtime === "node" || runtime === "bun") {
            const { readFileSync } = require("fs");
            fileContent = readFileSync(filePath, "utf8");
        }
        else if (runtime === "deno") {
            fileContent = new TextDecoder("utf-8").decode(Deno.readFileSync(filePath));
        }
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
                if (runtime === "node" || runtime === "bun") {
                    process.env[key] = parsedValue;
                }
                else if (runtime === "deno") {
                    Deno.env.set(key, parsedValue);
                }
            }
        }
    }
    catch (error) {
        console.error(`[dotenv] Error parsing file: ${filePath}`, error);
    }
}
function loadEnv(basePath = "./") {
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
