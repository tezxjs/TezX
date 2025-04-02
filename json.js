const fs = require("fs");
const path = require("path");

function formatTitle(name) {
  return (
    name
      ?.replace(/\.md$/, "")
      ?.replace(/^[(\s]*\d+[)\.\s_-]*/, "") // Remove leading numbers with optional brackets, dots, underscores, or spaces
      ?.replace(/[,]/g, "") // Remove unwanted symbols
      // ?.replace(/[[\](),]/g, "") // Remove unwanted symbols
      ?.replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
      ?.replace(/\s+/g, " ") // Collapse multiple spaces into a single space
      ?.replace(/^\d+[-_]/, "") // Remove leading numbers followed by hyphen, underscore, or space
      ?.trim() // Trim leading and trailing whitespace
      ?.replace(/\b\w/g, (char) => char.toUpperCase())
  ); // Capitalize each word
}
function formatPathname(name) {
  return name
    ?.replace(/\.md$/i, "") // Remove `.md` extension (case insensitive)
    ?.replace(/^[(\s]*\d+[)\.\s_-]*/, "") // Remove leading numbers with optional brackets, dots, underscores, or spaces
    ?.replace(/[^a-zA-Z0-9\s/-]/g, "") // Remove unwanted symbols except slashes (`/`) and hyphens
    ?.replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and multiple hyphens with a single hyphen
    ?.replace(/\/+/g, "/") // Collapse multiple slashes into a single slash
    ?.replace(/-\//g, "/") // Fix `-` followed by `/` to just `/`
    ?.replace(/\/-/g, "/") // Fix `/` followed by `-` to just `/`
    ?.trim() // Remove leading and trailing whitespace
    ?.toLowerCase(); // Convert to lowercase
}

function normalizePath(path) {
  return path
    ?.replace(/\\+/g, "/") // Replace backslashes with forward slashes (for cross-platform support)
    ?.replace(/^\/+/g, "") // Remove leading slashes
    ?.replace(/\/+$/, "");
}

function getMarkdownFiles(dir, baseDir = dir) {
  let results = [];

  function traverse(currentDir, structure) {
    let files = fs.readdirSync(currentDir);

    files.forEach((file) => {
      let fullPath = path.join(currentDir, file);
      let relativePath = path.relative(baseDir, fullPath);
      let stats = fs.statSync(fullPath);
      // const current_path = `${pathname}/${formatPathname(entry?.name)}`;

      if (stats.isDirectory()) {
        let folderStructure = {
          originalPath: file,
          name: formatTitle(file),
          path: formatPathname(normalizePath(relativePath)),
          type: "folder",
          children: [],
        };
        traverse(fullPath, folderStructure.children);
        structure.push(folderStructure);
      } else if (file.endsWith(".md")) {
        let content = fs.readFileSync(fullPath, "utf-8");
        structure.push({
          originalPath: file,
          id: results.length + 1,
          name: formatTitle(file),
          type: "file",
          path: normalizePath(relativePath)
            ?.split("/")
            ?.map((r) => formatPathname(r))
            ?.join("/"),
          content: content,
        });
        results.push({
          id: results.length + 1,
          path: normalizePath(relativePath)
            ?.split("/")
            ?.map((r) => formatPathname(r))
            ?.join("/"),
          name: formatTitle(file),
          folder: normalizePath(path.dirname(relativePath))
            ?.split("/")
            ?.map((r) => formatTitle(r))
            ?.join("/"),
          content,
        });
      }
    });
  }

  let finalStructure = [];
  traverse(dir, finalStructure);

  return { structure: finalStructure, files: results };
}

const markdownData = getMarkdownFiles("./docs");
fs.writeFileSync("./src/app/docs.json", JSON.stringify(markdownData, null, 2));

console.log("Markdown data saved in output.json");
