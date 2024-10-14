#!/usr/bin/env node

const fs = require("fs-extra");
const fg = require("fast-glob");
const path = require("path");
const { createRequire } = require("module");

const purgeFlag = ".purged";
const importsRegex =
  /import([ \n\t]+(?:[^ \n\t\{\}]+[ \n\t]*,?)?(?:[ \n\t]*\{(?:[ \n\t]*[^ \n\t"'\{\}]+[ \n\t]*,?)+\})?[ \n\t]*)from[ \n\t]*(['"])([^'"\n]+)(?:['"])/g;
const sourceDir = process.argv[2] || "src";

const cwdRequire = createRequire(path.join(process.cwd(), "package.json"));

const reactIconsPath = path.dirname(cwdRequire.resolve("react-icons"));
const originalReactIconsPath = `${reactIconsPath}_original`;
const sourcePath = path.join(process.cwd(), sourceDir);

const isPurged = fs.pathExistsSync(path.join(reactIconsPath, purgeFlag));

if (!isPurged) {
  console.log("First time running, creating backup.");
  fs.copySync(reactIconsPath, originalReactIconsPath);
}

const sourceFiles = fg.sync(`${sourcePath}/**/*.{js,jsx,ts,tsx,mjs}`);

const detectedModules = {};

for (const [index, sourceFile] of Object.entries(sourceFiles)) {
  const sourceContent = fs.readFileSync(sourceFile, "utf8");
  const imports = sourceContent.matchAll(importsRegex);

  /*console.log(
    "Processing file",
    sourceFile,
    `(${parseInt(index) + 1}/${sourceFiles.length})`,
  );*/

  for (const match of imports) {
    const pkg = match[3];
    if (!pkg || !pkg.startsWith("react-icons/")) {
      continue;
    }

    const group = pkg.split("/").pop();

    detectedModules[group] ??= new Set();

    match[1]
      .replace(/\n/g, " ")
      .replace(/type|\{|}/g, "")
      .replace(/as [a-zA-Z0-9]/g, "")
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean)
      .forEach((m) => detectedModules[group].add(m));
  }
}

let total = 0;

for (const [group, modules] of Object.entries(detectedModules)) {
  const groupPath = path.join(originalReactIconsPath, group);
  const groupFiles = fg.sync(`${groupPath}/**/index.{js,mjs}`);
  const modulesRegexp = new RegExp(` (${Array.from(modules).join("|")}) `, "g");

  //console.log(`[ .](${Array.from(modules).join("|")}) `);

  console.log("Processing", group, modules.size);

  for (const groupFile of groupFiles) {
    if (groupFile.includes("/lib/")) {
      continue;
    }

    let output = [];
    const content = fs.readFileSync(groupFile, "utf8").split("\n");
    let add = false;

    for (const line of content) {
      const isIcon = modulesRegexp.test(line);

      if (add && line.trim() === "};") {
        output.push(line);
        add = false;
      } else if (add) {
        output.push(line);
      } else if (/import |require\(/.test(line)) {
        output.push(line);
      } else if (isIcon) {
        add = true;
        output.push(line);
      }
    }
    //console.log("Purging", groupFile.replace("_original", ""), output);
    fs.writeFileSync(groupFile.replace("_original", ""), output.join("\n"));
  }
  total += modules.size;
}

console.log(`Only ${total} icons left in the source.`);

fs.writeFileSync(path.join(reactIconsPath, purgeFlag), "");
