import { sanitized } from "./low-level.js";
export async function useFormData(ctx, options) {
    const fd = await ctx.req.formData();
    const result = {};
    let totalFileBytes = 0;
    for (const [key, originalVal] of fd.entries()) {
        let val = originalVal;
        if (val instanceof File && options) {
            val = await processFile(val, key, options, () => totalFileBytes);
            totalFileBytes += val.size;
            if (typeof options.maxTotalSize === "number" &&
                totalFileBytes > options.maxTotalSize) {
                throw new Error(`Total file bytes exceeded maxTotalSize=${options.maxTotalSize}`);
            }
        }
        else if (typeof val === "string" &&
            options?.maxFieldSize &&
            val.length > options.maxFieldSize) {
            throw new Error(`Field "${key}" length ${val.length} exceeds maxFieldSize=${options.maxFieldSize}`);
        }
        if (key in result) {
            if (!Array.isArray(result[key])) {
                result[key] = [result[key]];
            }
            result[key].push(val);
        }
        else {
            result[key] = val;
        }
        if (val instanceof File && typeof options?.maxFiles === "number") {
            const filesForKey = Array.isArray(result[key])
                ? result[key].filter((v) => v instanceof File).length
                : result[key] instanceof File
                    ? 1
                    : 0;
            if (filesForKey > options.maxFiles) {
                throw new Error(`Field "${key}" exceeds maxFiles (${options.maxFiles})`);
            }
        }
    }
    return result;
}
export async function processFile(file, key, options, totalGetter) {
    let name = file.name;
    if (options.sanitized) {
        name = `${Date.now()}-${sanitized(name)}`;
    }
    if (Array.isArray(options.allowedTypes) &&
        !options.allowedTypes.includes(file.type)) {
        throw new Error(`Field "${key}": invalid file type "${file.type}". Allowed: ${options.allowedTypes.join(", ")}`);
    }
    if (typeof options.maxSize === "number" && file.size > options.maxSize) {
        throw new Error(`Field "${key}": file size ${file.size} > maxSize ${options.maxSize}`);
    }
    if (name !== file.name) {
        return new File([await file.arrayBuffer()], name, { type: file.type });
    }
    return file;
}
