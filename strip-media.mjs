import { readFileSync, writeFileSync, copyFileSync } from "node:fs";

const file = process.argv[2] || "src/index.css";
const css = readFileSync(file, "utf8");

let out = "";
let i = 0;
let removed = 0;

while (i < css.length) {
  const start = css.indexOf("@media", i);

  if (start === -1) {
    out += css.slice(i);
    break;
  }

  out += css.slice(i, start);

  const open = css.indexOf("{", start);
  let depth = 1;
  let j = open + 1;

  while (j < css.length && depth > 0) {
    if (css[j] === "{") depth += 1;
    if (css[j] === "}") depth -= 1;
    j += 1;
  }

  removed += 1;
  i = j;
}

copyFileSync(file, `${file}.bak`);
writeFileSync(file, out.replace(/\n{3,}/g, "\n\n"));

console.log(`Removed ${removed} @media blocks from ${file}`);
console.log(`Backup saved as ${file}.bak`);