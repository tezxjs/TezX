// ---------- MIME Type Mapping ----------
export const mimeTypes = {
  // Text/Web Formats
  html: "text/html",
  htm: "text/html",
  css: "text/css",
  js: "text/javascript",
  mjs: "text/javascript",
  json: "application/json",
  xml: "application/xml",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  tsv: "text/tab-separated-values",
  rtf: "application/rtf",
  markdown: "text/markdown",
  jsx: "text/javascript",
  ts: "text/typescript", // Browser doesn't run TS, but useful for serving
  tsx: "text/typescript",
  jsonld: "application/ld+json",

  // Image Formats
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  ico: "image/x-icon",
  bmp: "image/bmp",
  tiff: "image/tiff",
  psd: "image/vnd.adobe.photoshop",
  tif: "image/tiff",
  avif: "image/avif",

  // ✅ Fonts
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  eot: "application/vnd.ms-fontobject",

  // Video Formats
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  wmv: "video/x-ms-wmv",
  flv: "video/x-flv",
  "3gp": "video/3gpp",
  mkv: "video/x-matroska",
  mpeg: "video/mpeg",
  mpg: "video/mpeg",

  // Audio Formats
  mp3: "audio/mpeg",
  wav: "audio/wav",
  aac: "audio/aac",
  flac: "audio/flac",
  m4a: "audio/mp4",
  mid: "audio/midi",
  midi: "audio/midi",
  weba: "audio/webm",

  // Application/Document Formats
  pdf: "application/pdf",
  odp: "application/vnd.oasis.opendocument.presentation",
  zip: "application/zip",
  gz: "application/gzip",
  tar: "application/x-tar",
  rar: "application/x-rar-compressed",
  _7z: "application/x-7z-compressed",
  bz2: "application/x-bzip2",
  "7z": "application/x-7z-compressed",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",

  // Programming/Data Formats
  wasm: "application/wasm",
  map: "application/json", // Source maps
  yaml: "application/yaml",
  yml: "application/yaml",
  proto: "text/plain",
  graphql: "application/graphql",

  // Security/Config Formats
  pem: "application/x-pem-file",
  cer: "application/pkix-cert",
  crt: "application/x-x509-ca-cert",
  key: "application/x-pem-file",
  pfx: "application/x-pkcs12",

  // 3D/Model Formats
  glb: "model/gltf-binary",
  gltf: "model/gltf+json",
  obj: "model/obj",
  stl: "model/stl",

  // Virtual/Mixed Reality
  usdz: "model/vnd.usdz+zip",

  // System Formats
  exe: "application/x-msdownload",
  dmg: "application/x-apple-diskimage",
  deb: "application/x-debian-package",
  rpm: "application/x-redhat-package-manager",
  apk: "application/vnd.android.package-archive",
  bin: "application/octet-stream",
  iso: "application/octet-stream",
  // Special Web Formats
  webmanifest: "application/manifest+json",
  ics: "text/calendar",
  vcf: "text/vcard",
  warc: "application/warc",
  atom: "application/atom+xml",
  rss: "application/rss+xml",

  // Executables and scripts
  dll: "application/x-msdownload",
  sh: "application/x-sh",
  py: "text/x-python",
  rb: "text/x-ruby",
  pl: "text/x-perl",
  php: "application/x-httpd-php",

  // Miscellaneous
  torrent: "application/x-bittorrent",
  ipa: "application/vnd.iphone",
  eps: "application/postscript",
  ps: "application/postscript",
  ai: "application/postscript",
  swf: "application/x-shockwave-flash",
  jar: "application/java-archive",
  gcode: "text/x.gcode",
} as const;

export type ContentType = (typeof mimeTypes[keyof typeof mimeTypes]) | "application/octet-stream" | (string & {});

export const defaultMimeType = "application/octet-stream";

// ---------- File System Utilities ----------
