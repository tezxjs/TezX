
// ! passed benchmark: extensionExtract (130.18ms) iterations: 500_000
/**
 * Extracts the file extension from a given file path or filename.
 * The returned extension is always lowercase.
 *
 * @param {string} filePath - The full file path or filename.
 * @returns {string} The file extension without the dot, or an empty string if none found.
 *
 * @example
 * extensionExtract("image.PNG"); // → "png"
 * extensionExtract("/path/to/archive.tar.gz"); // → "gz"
 * extensionExtract("filename"); // → ""
 */
export function extensionExtract(filePath: string): string {
  let lastDot = -1;
  for (let i = filePath.length - 1; i >= 0; i--) {
    if (filePath[i] === ".") {
      lastDot = i;
      break;
    }
  }
  if (lastDot === -1 || lastDot === filePath.length - 1) return "";

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

/**
 * Ultra-fast string slugifier.
 * Uses low-level string operations to reduce RegExp overhead.
 * Falls back to minimal replacements if environment lacks full RegExp support.
 *
 * @param {string} title - Input string to slugify
 * @returns {string} - Slugified, URL-safe string
 */
export function sanitized(title: string): string {
  const len = title.length;
  let result = "";
  let dash = false;

  for (let i = 0; i < len; i++) {
    let ch = title.charCodeAt(i);

    // Convert uppercase A-Z to lowercase a-z
    if (ch >= 65 && ch <= 90) ch += 32;

    // Allow lowercase a-z, numbers 0-9
    if ((ch >= 97 && ch <= 122) || (ch >= 48 && ch <= 57) || ch === 46) {
      result += String.fromCharCode(ch);
      dash = false;
    }
    // Treat space or underscore as dash
    else if (ch === 32 || ch === 95 || ch === 45) {
      if (!dash && result.length > 0) {
        result += "-";
        dash = true;
      }
    }
  }

  // Trim trailing dash
  return result.endsWith("-") ? result.slice(0, -1) : result;
}
