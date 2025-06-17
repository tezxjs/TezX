export function sanitized(title) {
    const base = title
        .toLowerCase()
        .trim()
        .replace(/[_\s]+/g, "-")
        .replace(/[^a-z0-9-.]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+|-+$/g, "");
    return base;
}
