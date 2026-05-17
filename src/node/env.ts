import { existsSync, readFileSync } from "node:fs";
import { colorText } from "../utils/colors.js";

/**
 * Parses a .env file and loads its variables into the environment.
 * @param filePath - The path to the .env file.
 */
function parseEnvFile(filePath: string, result: Record<string, string>) {
  try {
    let fileExists = existsSync(filePath);
    if (!fileExists) {
      // console.warn(`[dotenv] File not found: ${filePath}`);
      return;
    }

    // Read the file content
    let fileContent = "";
    fileContent = readFileSync(filePath, "utf8");
    // Parse the file content
    const lines = fileContent.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) continue; // Skip comments and empty lines

      const [key, value] = trimmedLine.split("=", 2).map((part) => part.trim());

      if (key && value) {
        const parsedValue = value
          .replace(/^"(.*)"$/, "$1")
          .replace(/^'(.*)'$/, "$1"); // Remove quotes
        result[key] = parsedValue;
        process.env[key] = parsedValue;
      }
    }
  } catch (error) {
    console.error(`[dotenv] Error parsing file: ${filePath}`, error);
  }
}

/**
 * Loads environment variables from .env files.
 * @param basePath - The base directory where .env files are located.
 */
export function loadEnv(basePath: string = "./") {
  const result: Record<string, string> = {};

  const envFiles = [
    ".env",
    ".env.local",
    `.env.${process?.env?.NODE_ENV || "development"}`, // Supports NODE_ENV (e.g., .env.development, .env.production)
    `.env.${process?.env?.NODE_ENV || "development"}.local`,
  ];

  for (const envFile of envFiles) {
    parseEnvFile(
      `${basePath && basePath?.endsWith("/") ? basePath : `${basePath}/`}${envFile}`,
      result,
    );
  }

  return result;
}
