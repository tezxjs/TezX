export function extensionExtract(filePath) {
    let lastDot = -1;
    for (let i = filePath.length - 1; i >= 0; i--) {
        if (filePath[i] === ".") {
            lastDot = i;
            break;
        }
    }
    if (lastDot === -1 || lastDot === filePath.length - 1)
        return "";
    let ext = "";
    for (let i = lastDot + 1; i < filePath.length; i++) {
        let c = filePath.charCodeAt(i);
        if (c >= 65 && c <= 90) {
            c += 32;
        }
        ext += String.fromCharCode(c);
    }
    return ext;
}
export function sanitized(title) {
    const len = title.length;
    let result = "";
    let dash = false;
    for (let i = 0; i < len; i++) {
        let ch = title.charCodeAt(i);
        if (ch >= 65 && ch <= 90)
            ch += 32;
        if ((ch >= 97 && ch <= 122) || (ch >= 48 && ch <= 57) || ch === 46) {
            result += String.fromCharCode(ch);
            dash = false;
        }
        else if (ch === 32 || ch === 95 || ch === 45) {
            if (!dash && result.length > 0) {
                result += "-";
                dash = true;
            }
        }
    }
    return result.endsWith("-") ? result.slice(0, -1) : result;
}
