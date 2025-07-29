import { Context } from "../index.js";
import { FormDataOptions } from "../types/index.js";
/**
 * Parses and validates multipart/form-data from the request context.
 *
 * This helper extracts form fields and files from the request's FormData,
 * applies validation rules defined in the `options`, and returns a structured
 * object with key-value pairs, where values can be strings, Files, or arrays of them.
 *
 * Validation includes:
 * - File MIME type whitelist
 * - Maximum file size per file
 * - Maximum number of files per field
 * - Maximum combined size of all uploaded files
 * - Maximum length of individual text fields
 * - Optional sanitization of text fields (if enabled)
 *
 * Repeated form field keys will result in an array of values.
 *
 * @param {Context} ctx - The HTTP request context containing the FormData.
 * @param {FormDataOptions} [options] - Configuration options to control parsing and validation.
 * @throws {Error} Throws if any validation rule is violated (e.g., file too large, too many files).
 * @returns {Promise<Record<string, string | File | (string | File)[]>>} A Promise resolving to an object mapping form field names
 * to their respective values. Values are strings or File objects, or arrays if multiple values per key exist.
 *
 * @example
 * ```ts
 * import { useFormData } from "tezx/helper";
 *
 * const formData = await useFormData(ctx, {
 *   allowedTypes: ["image/jpeg", "image/png"],
 *   maxSize: 5 * 1024 * 1024, // 5MB per file
 *   maxFiles: 3,
 *   maxTotalSize: 15 * 1024 * 1024, // 15MB total
 *   maxFieldSize: 1000,
 *   sanitized: true
 * });
 * ```
 */
export declare function useFormData<T extends Record<string, string | File | (string | File)[]>>(ctx: Context, options?: FormDataOptions): Promise<T>;
export declare function processFile(file: File, key: string, options: FormDataOptions, totalGetter: () => number): Promise<File>;
