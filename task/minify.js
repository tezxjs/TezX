const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const tool = "npx terser"; // Change to "esbuild" if using esbuild

// Recursively find all .js files
function getJSFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    return entry.isDirectory()
      ? getJSFiles(entryPath)
      : entry.name.endsWith(".js") || entry?.name?.endsWith(".mjs")
        ? [entryPath]
        : [];
  });
}

// Minify all files
const files = getJSFiles("./dist");
console.log(files);

files.forEach((file) => {
  console.log(`Minifying ${file}`);
  execSync(`${tool} ${file} --compress --mangle -o ${file}`);
});
