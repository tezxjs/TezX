"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizePathSplit = sanitizePathSplit;
exports.urlParse = urlParse;
function sanitizePathSplit(basePath, path) {
  const parts = `${basePath}/${path}`
    .replace(/\\/g, "")
    ?.split("/")
    .filter(Boolean);
  return parts;
}
function urlParse(url) {
  let u = URL.parse(url);
  let query = {};
  if (u?.search) {
    const queryPart = decodeURIComponent(u?.search);
    new URLSearchParams(queryPart).forEach((value, key) => {
      console.log(key, value);
      query[key] = value;
    });
  }
  return {
    pathname: u?.pathname,
    query: query,
    protocol: u?.protocol,
    origin: u?.origin,
    hostname: u?.hostname,
    href: url,
    port: u?.port,
  };
}
