import { EnvironmentDetector } from "../environment";
// Detect runtime environment
/**
 * Parses a .env file and loads its variables into the environment.
 * @param filePath - The path to the .env file.
 */
function parseEnvFile(filePath, result) {
    try {
        let fileExists = false;
        let runtime = EnvironmentDetector.getEnvironment;
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
            // console.warn(`[dotenv] File not found: ${filePath}`);
            return;
        }
        // Read the file content
        let fileContent = "";
        if (runtime === "node" || runtime === "bun") {
            const { readFileSync } = require("fs");
            fileContent = readFileSync(filePath, "utf8");
        }
        else if (runtime === "deno") {
            fileContent = new TextDecoder("utf-8").decode(Deno.readFileSync(filePath));
        }
        // Parse the file content
        const lines = fileContent.split("\n");
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith("#"))
                continue; // Skip comments and empty lines
            const [key, value] = trimmedLine.split("=", 2).map((part) => part.trim());
            if (key && value) {
                const parsedValue = value
                    .replace(/^"(.*)"$/, "$1")
                    .replace(/^'(.*)'$/, "$1"); // Remove quotes
                result[key] = parsedValue;
                if (runtime === "node" || runtime === "bun") {
                    process.env[key] = parsedValue;
                }
                else if (runtime === "deno") {
                    Deno.env.set(key, parsedValue);
                }
            }
            // const match = trimmedLine.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            // //         if (match) {
            // //             const key = match[1];
            // //             let value = match[2] || '';
            // //             // Remove quotes around the value
            // //             value = value.replace(/^['"]|['"]$/g, '');
            // //             result[key] = value;
            // //         }
        }
        // console.log(`[dotenv] Loaded variables from: ${filePath}`);
    }
    catch (error) {
        console.error(`[dotenv] Error parsing file: ${filePath}`, error);
    }
}
/**
 * Loads environment variables from .env files.
 * @param basePath - The base directory where .env files are located.
 */
export function loadEnv(basePath = "./") {
    const result = {};
    const envFiles = [
        ".env",
        ".env.local",
        `.env.${process?.env?.NODE_ENV || "development"}`, // Supports NODE_ENV (e.g., .env.development, .env.production)
        `.env.${process?.env?.NODE_ENV || "development"}.local`,
    ];
    for (const envFile of envFiles) {
        parseEnvFile(`${basePath}${envFile}`, result);
    }
    // if (isNode) {
    // Object.assign(process.env, result);
    // } else if (isDeno) {
    //     for (const [key, value] of Object.entries(envVars)) {
    //         Deno.env.set(key, value);
    //     }
    // } else if (isBun) {
    //     Object.assign(Bun.env, envVars);
    // }
    return result;
}
// // Runtime detection
// /**
//  * Parses a .env file into key-value pairs.
//  * @param {string} content - The content of the .env file.
//  * @returns {Record<string, string>} - Parsed key-value pairs.
//  */
// function parseEnv(content: string) {
//     const result: Record<string, string> = {};
//     const lines = content.split('\n');
//     for (const line of lines) {
//         // Ignore comments and empty lines
//         const trimmedLine = line.trim();
//         if (!trimmedLine || trimmedLine.startsWith('#')) continue;
//         // Match key=value pairs
//         const match = trimmedLine.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
//         if (match) {
//             const key = match[1];
//             let value = match[2] || '';
//             // Remove quotes around the value
//             value = value.replace(/^['"]|['"]$/g, '');
//             result[key] = value;
//         }
//     }
//     return result;
// }
// /**
//  * Loads environment variables from a .env file into the runtime's environment.
//  * @param {string} filePath - Path to the .env file.
//  * @returns {Promise<Record<string, string>>} - Parsed key-value pairs.
//  */
// export async function loadEnv(filePath: string) {
//     let content;
//     const runtime = EnvironmentDetector.getEnvironment;
//     try {
//         if (runtime === 'node') {
//             // Use Node.js fs module
//             const fs = await import('fs/promises');
//             content = await fs.readFile(filePath, 'utf8');
//         } else if (runtime === 'deno') {
//             // Use Deno.readTextFile
//             content = await Deno.readTextFile(filePath);
//         } else if (runtime === 'bun') {
//             // Use Bun.file
//             content = await Bun.file(filePath).text();
//         } else {
//             throw new Error('Unsupported runtime environment');
//         }
//     } catch (error: any) {
//         throw new Error(`Failed to read .env file: ${error.message}`);
//     }
//     // Parse the .env file
//     const envVars = parseEnv(content);
//     // // Inject into the runtime's environment
//     // if (isNode) {
//     //     Object.assign(process.env, envVars);
//     // } else if (isDeno) {
//     //     for (const [key, value] of Object.entries(envVars)) {
//     //         Deno.env.set(key, value);
//     //     }
//     // } else if (isBun) {
//     //     Object.assign(Bun.env, envVars);
//     // }
//     return envVars;
// }
