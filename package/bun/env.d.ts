/**
 * Loads environment variables from .env files (Bun version).
 * @param basePath - The base directory where .env files are located.
 */
export declare function loadEnv(basePath?: string): Promise<Record<string, string>>;
