import { readFile, writeFile } from "node:fs/promises";

await writeFile(
    "src/interface/views/assets.generated.js",
    `export const APP_CSS = ${JSON.stringify(await readFile("public/build/assets/app.css", "utf8"))};\nexport const APP_JS = ${JSON.stringify(await readFile("public/build/assets/app.js", "utf8"))};\n`,
);
