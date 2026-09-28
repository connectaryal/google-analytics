// Post-build step for the declarations emitted by `tsc --emitDeclarationOnly`.
//
// 1. Adds explicit extensions to relative imports in dist/**/*.d.ts
//    ("./core/GoogleAnalytics" -> "./core/GoogleAnalytics.js"). The package is
//    "type": "module", so consumers type-checking with moduleResolution
//    node16/nodenext can't resolve extensionless specifiers. The JS itself is a
//    single bundle, so only the declarations need this.
// 2. Copies the declarations into dist/cjs next to the CommonJS bundle, with a
//    {"type":"commonjs"} package.json, so require() consumers get CJS-typed
//    declarations.
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const DIST = "dist";
const CJS_DIR = join(DIST, "cjs");

const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*)(["'])(\.{1,2}\/[^"']*)\2/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (path === CJS_DIR) continue;
    if (statSync(path).isDirectory()) walk(path, out);
    else if (name.endsWith(".d.ts")) out.push(path);
  }
  return out;
}

function withExtension(file, specifier) {
  if (/\.(js|mjs|cjs|json)$/.test(specifier)) return specifier;
  const base = join(dirname(file), specifier);
  if (existsSync(`${base}.d.ts`)) return `${specifier}.js`;
  if (existsSync(join(base, "index.d.ts"))) return `${specifier}/index.js`;
  throw new Error(`${file}: cannot resolve "${specifier}"`);
}

const files = walk(DIST);

for (const file of files) {
  const fixed = readFileSync(file, "utf8").replace(
    SPECIFIER,
    (_, lead, quote, spec) => `${lead}${quote}${withExtension(file, spec)}${quote}`,
  );
  writeFileSync(file, fixed);

  // The .d.ts.map files point at ../src relative to the original location;
  // drop the reference rather than ship a broken one in the relocated copy.
  const cjsFile = join(CJS_DIR, relative(DIST, file));
  mkdirSync(dirname(cjsFile), { recursive: true });
  writeFileSync(cjsFile, fixed.replace(/\n?\/\/# sourceMappingURL=.*$/, ""));
}

mkdirSync(CJS_DIR, { recursive: true });
writeFileSync(join(CJS_DIR, "package.json"), `${JSON.stringify({ type: "commonjs" })}\n`);

console.log(`fix-dts: rewrote ${files.length} declaration files, copied to ${CJS_DIR}`);
