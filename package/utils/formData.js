import { EnvironmentDetector } from "../core/environment";
export async function parseJsonBody(req) {
    const runtime = EnvironmentDetector.getEnvironment;
    if (runtime === "node") {
        return new Promise((resolve, reject) => {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString();
            });
            req.on("end", () => {
                try {
                    resolve(JSON.parse(body));
                }
                catch (error) {
                    reject(new Error("Invalid JSON format"));
                }
            });
        });
    }
    else if (runtime === "deno" || runtime === "bun") {
        return await req.json();
    }
    else {
        throw new Error("Unsupported environment for multipart parsing");
    }
}
export async function parseTextBody(req) {
    const runtime = EnvironmentDetector.getEnvironment;
    if (runtime === "node") {
        return new Promise((resolve, reject) => {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString();
            });
            req.on("end", () => {
                try {
                    resolve(body);
                }
                catch (error) {
                    reject(new Error("Invalid JSON format"));
                }
            });
        });
    }
    else if (runtime === "deno" || runtime === "bun") {
        return await req.text();
    }
    else {
        throw new Error("Unsupported environment for multipart parsing");
    }
}
export async function parseUrlEncodedBody(req) {
    const runtime = EnvironmentDetector.getEnvironment;
    if (runtime === "node") {
        return new Promise((resolve, reject) => {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString("binary");
            });
            req.on("end", () => {
                try {
                    const pairs = body.split("&");
                    const formData = {};
                    pairs.forEach((pair) => {
                        const [key, value] = pair.split("=");
                        formData[decodeURIComponent(key)] = decodeURIComponent(value || "");
                    });
                    resolve(formData);
                }
                catch {
                    reject(new Error("Invalid x-www-form-urlencoded format"));
                }
            });
        });
    }
    else if (runtime === "deno" || runtime === "bun") {
        const formData = await req.formData();
        const result = {};
        for (const [key, value] of formData.entries()) {
            result[key] = value;
        }
        return result;
    }
    else {
        throw new Error("Unsupported environment for multipart parsing");
    }
}
export async function parseMultipartBody(req, boundary, options) {
    const runtime = EnvironmentDetector.getEnvironment;
    if (runtime === "node") {
        return new Promise((resolve, reject) => {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString("binary");
            });
            req.on("end", () => {
                try {
                    const formDataField = {};
                    const formDataFieldParts = body.split("----------------------------");
                    formDataFieldParts.forEach((part) => {
                        const match = part.match(/name="(.*)"\r\n\r\n(.*)\r\n/);
                        if (match && match.length === 3) {
                            const name = match[1];
                            const value = match[2];
                            if (formDataField[name]) {
                                if (Array.isArray(formDataField[name])) {
                                    formDataField[name].push(value);
                                }
                                else {
                                    formDataField[name] = [formDataField[name], value];
                                }
                            }
                            else {
                                formDataField[name] = value;
                            }
                        }
                    });
                    const parts = body.split(`--${boundary}`);
                    for (const part of parts) {
                        if (part.includes("filename")) {
                            const filenameMatch = part.match(/filename="([^"]+)"/);
                            const fieldNameMatch = part.match(/name="([^"]+)"/);
                            const contentTypeMatch = part.match(/Content-Type: ([^\r\n]+)/);
                            if (filenameMatch && fieldNameMatch && contentTypeMatch) {
                                let filename = filenameMatch[1];
                                const fieldName = fieldNameMatch[1];
                                const contentType = contentTypeMatch[1];
                                if (options?.sanitized) {
                                    filename =
                                        `${Date.now()}-${filename.replace(/\s+/g, "")?.replace(/[^a-zA-Z0-9.-]/g, "-")}`?.toLowerCase();
                                }
                                if (Array.isArray(options?.allowedTypes) &&
                                    !options.allowedTypes?.includes(contentType)) {
                                    reject(new Error(`Invalid file type: "${contentType}". Allowed types: ${options.allowedTypes.join(", ")}`));
                                }
                                const fileContentStartIndex = part.indexOf("\r\n\r\n") + 4;
                                const fileContent = Buffer.from(part.substring(fileContentStartIndex), "binary");
                                const arrayBuffer = fileContent.buffer.slice(fileContent.byteOffset, fileContent.byteOffset + fileContent.byteLength);
                                if (typeof options?.maxSize !== "undefined" &&
                                    fileContent.byteLength > options.maxSize) {
                                    reject(new Error(`File size exceeds the limit: ${fileContent.byteLength} bytes (Max: ${options.maxSize} bytes)`));
                                }
                                const file = new File([arrayBuffer], filename, {
                                    type: contentType,
                                });
                                if (typeof options?.maxFiles != "undefined" &&
                                    options.maxFiles == 0) {
                                    reject(new Error(`Field "${fieldName}" exceeds the maximum allowed file count of ${options.maxFiles}.`));
                                }
                                if (formDataField[fieldName]) {
                                    if (Array.isArray(formDataField[fieldName])) {
                                        const existingFiles = formDataField[fieldName].filter(f => f instanceof File);
                                        if (typeof options?.maxFiles != "undefined" &&
                                            existingFiles.length >= options.maxFiles) {
                                            reject(new Error(`Field "${fieldName}" exceeds the maximum allowed file count of ${options.maxFiles}.`));
                                        }
                                        formDataField[fieldName].push(file);
                                    }
                                    else {
                                        if (formDataField[fieldName] instanceof File && typeof options?.maxFiles != "undefined" && options.maxFiles == 1) {
                                            reject(new Error(`Field "${fieldName}" exceeds the maximum allowed file count of ${options.maxFiles}.`));
                                        }
                                        formDataField[fieldName] = [formDataField[fieldName], file];
                                    }
                                }
                                else {
                                    formDataField[fieldName] = file;
                                }
                            }
                        }
                    }
                    resolve(formDataField);
                }
                catch { }
            });
        });
    }
    else if (runtime === "deno" || runtime === "bun") {
        const formData = await req.formData();
        const result = {};
        for (const [key, value] of formData.entries()) {
            let val = value;
            if (val instanceof File && typeof options == "object") {
                let filename = val.name;
                if (options?.sanitized) {
                    filename =
                        `${Date.now()}-${filename.replace(/\s+/g, "")?.replace(/[^a-zA-Z0-9.-]/g, "-")}`?.toLowerCase();
                }
                if (Array.isArray(options?.allowedTypes) &&
                    !options.allowedTypes?.includes(val.type)) {
                    throw new Error(`Invalid file type: "${val.type}". Allowed types: ${options.allowedTypes.join(", ")}`);
                }
                if (typeof options?.maxSize !== "undefined" &&
                    val.size > options.maxSize) {
                    throw new Error(`File size exceeds the limit: ${val.size} bytes (Max: ${options.maxSize} bytes)`);
                }
                if (typeof options?.maxFiles != "undefined" && options.maxFiles == 0) {
                    throw new Error(`Field "${key}" exceeds the maximum allowed file count of ${options.maxFiles}.`);
                }
                val = new File([await val.arrayBuffer()], filename, {
                    type: val.type,
                });
            }
            if (result[key]) {
                if (Array.isArray(result[key])) {
                    if (val instanceof File &&
                        typeof options?.maxFiles != "undefined" &&
                        result[key]?.length >= options.maxFiles) {
                        throw new Error(`Field "${key}" exceeds the maximum allowed file count of ${options.maxFiles}.`);
                    }
                    result[key].push(val);
                }
                else {
                    if (val instanceof File &&
                        typeof options?.maxFiles != "undefined" && options.maxFiles == 1) {
                        throw new Error(`Field "${key}" exceeds the maximum allowed file count of ${options.maxFiles}.`);
                    }
                    result[key] = [result[key], val];
                }
            }
            else {
                result[key] = val;
            }
        }
        return result;
    }
    else {
        throw new Error("Unsupported environment for multipart parsing");
    }
}
