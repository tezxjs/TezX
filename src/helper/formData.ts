import { Context } from "../index.js";
import { FormDataOptions } from "../types/index.js";
import { sanitized } from "../utils/utils.js";

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

export async function useFormData<T extends Record<string, string | File | (string | File)[]>>(ctx: Context, options?: FormDataOptions): Promise<T> {
  const fd = await ctx.req.formData();
  const result: Record<string, any> = {};
  let totalFileBytes = 0;
  for (const [key, originalVal] of fd.entries()) {
    let val: any = originalVal;
    // FILE case
    if (val instanceof File && options) {
      val = await processFile(val, key, options);
      totalFileBytes += val.size;
      if (typeof options.maxTotalSize === "number" && totalFileBytes > options.maxTotalSize) {
        throw new Error(`Total file bytes exceeded maxTotalSize=${options.maxTotalSize}`);
      }
    }
    else if (typeof val === "string" && options?.maxFieldSize && val.length > options.maxFieldSize) {
      throw new Error(`Field "${key}" length ${val.length} exceeds maxFieldSize=${options.maxFieldSize}`);
    }

    // Merge logic (repeat key → array)
    if (key in result) {
      if (!Array.isArray(result[key])) {
        result[key] = [result[key]];
      }
      result[key].push(val);
    } else {
      result[key] = val;
    }
    // Per-key maxFiles enforcement (অপ্টিমাইজড—filter ছাড়াই কাউন্ট রাখা)
    if (val instanceof File && typeof options?.maxFiles === "number") {
      const filesForKey = Array.isArray(result[key])
        ? (result[key] as any[]).filter((v) => v instanceof File).length
        : result[key] instanceof File
          ? 1
          : 0;
      if (filesForKey > options.maxFiles) {
        throw new Error(`Field "${key}" exceeds maxFiles (${options.maxFiles})`);
      }
    }
  }
  return result as T;
}

export async function processFile(file: File, key: string, options: FormDataOptions): Promise<File> {
  let name = file.name;
  if (options.sanitized) {
    name = `${Date.now()}-${sanitized(name)}`;
  }
  if (Array.isArray(options.allowedTypes) && !options.allowedTypes.includes(file.type)) {
    throw new Error(`Field "${key}": invalid file type "${file.type}". Allowed: ${options.allowedTypes.join(", ")}`,);
  }
  if (typeof options.maxSize === "number" && file.size > options.maxSize) {
    throw new Error(`Field "${key}": file size ${file.size} > maxSize ${options.maxSize}`);
  }
  // If rename needed, rebuild File
  if (name !== file.name) {
    return new File([await file.arrayBuffer()], name, { type: file.type });
  }
  return file;
}
