#!/usr/bin/env node
// build.js
//
// Usage:
//   node build.js build       -> clean + scss + translations
//   node build.js css         -> only compile scss
//   node build.js translations-> only translations
//   node build.js watch       -> watch scss & compendia

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const sass = require("sass");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const glob = require("glob");
const chokidar = require("chokidar");
const yaml = require("js-yaml");
const jsonFile = require("jsonfile");
const { compilePack } = require("@foundryvtt/foundryvtt-cli");

const SYSTEM_SCSS = ["scss/**/*.scss"];
const PACK_SRC = "./compendia";
const PACK_TEMP_SRC = "./.pack-src";       // temp YAML source dir for CLI
const PACK_DEST = "./src/packs";
const SYSTEM_JSON_PATH = "./src/system.json";

// ---------- helpers ----------

function log(...args) {
    console.log("[build]", ...args);
}

function handleError(err) {
    console.error(err?.stack || err?.toString?.() || err);
}

// Load src/system.json to get system id and packs metadata
async function loadSystemConfig() {
    const raw = await fsp.readFile(SYSTEM_JSON_PATH, "utf8");
    return JSON.parse(raw);
}

// Simple deterministic 16-char hash from compendium + item name.
// Not cryptographically secure; just stable and unique enough for IDs.
function makeDeterministicId(compendiumName, itemName) {
    const input = `${compendiumName}:${itemName}`.toLowerCase();
    let h1 = 0x811c9dc5;
    let h2 = 0x811c9dc5 ^ 0xffffffff;

    for (let i = 0; i < input.length; i++) {
        const ch = input.charCodeAt(i);
        h1 ^= ch;
        h1 = Math.imul(h1, 16777619);
        h2 ^= ch;
        h2 = Math.imul(h2, 2166136261);
    }

    const part1 = (h1 >>> 0).toString(16).padStart(8, "0");
    const part2 = (h2 >>> 0).toString(16).padStart(8, "0");
    return (part1 + part2).slice(0, 16);
}

// Ensure directory exists
async function ensureDir(dir) {
    await fsp.mkdir(dir, { recursive: true });
}

// ---------- SCSS compilation ----------

async function compileSingleScss(inputFile, outDir) {
    const rel = path.relative("scss", inputFile); // keep folder structure under scss/
    const outFile = path.join(outDir, rel.replace(/\.scss$/, ".css"));

    const result = sass.compile(inputFile, {
        style: "expanded", // matches outputStyle: 'expanded'
        loadPaths: ["scss"],
    });

    const post = await postcss([autoprefixer({ cascade: false })]).process(
        result.css,
        { from: inputFile, to: outFile }
    );

    await ensureDir(path.dirname(outFile));
    await fsp.writeFile(outFile, post.css, "utf8");
    log(`Compiled: ${inputFile} -> ${outFile}`);
}

async function compileScss() {
    log("Compiling SCSS...");

    // Only compile root stylesheets, not partials.
    const entrypoints = ["scss/od6s.scss"];

    const files = entrypoints.filter((file) => fs.existsSync(file));

    if (files.length === 0) {
        log("No SCSS entry files found");
        return;
    }

    await Promise.all(files.map((file) => compileSingleScss(file, "src/css")));
    log("SCSS compilation complete");
}

// ---------- Translations from YAML ----------

async function createTranslationsBase() {
    log("Creating translation base files...");
    const folders = fs
        .readdirSync(PACK_SRC)
        .filter((file) => fs.statSync(path.join(PACK_SRC, file)).isDirectory());

    for (const folder of folders) {
        const jsonPath = path.join(
            "src",
            "lang",
            "translations",
            "en",
            `od6s.${folder}.json`
        );

        // Build nice label from folder name
        let label = folder.replace("-", " ");
        label = label.replace(
            /(^\w{1})|(\s+\w{1})/g,
            (letter) => letter.toUpperCase()
        );

        // Find all YAML files in this folder
        const pattern = path.join(PACK_SRC, folder, "/**/*.yaml");
        const yamlFiles = glob.sync(pattern, {nodir: true});

        const newJson = {
            label,
            mapping: {
                description: "system.description",
            },
            entries: {},
        };

        for (const filePath of yamlFiles) {
            const fileContent = await fsp.readFile(filePath, "utf8");
            const docs = yaml.loadAll(fileContent) || [];

            for (const doc of docs) {
                if (!doc || typeof doc !== "object") continue;
                const name = doc.name;
                const description = doc?.system?.description ?? "";

                if (!name) continue;

                newJson.entries[name] = {
                    name,
                    description,
                };
            }
        }

        await ensureDir(path.dirname(jsonPath));
        await jsonFile.writeFile(jsonPath, newJson, {
            spaces: 2,
            EOL: "\r\n",
        });

        log(`Wrote translations: ${jsonPath}`);
    }

    log("Translation base generation complete");
}

// ---------- clean ----------

async function cleanBuild() {
    const target = path.join("src", "packs");
    log(`Cleaning ${target}...`);
    await fsp.rm(target, { recursive: true, force: true });

    log(`Cleaning ${PACK_TEMP_SRC}...`);
    await fsp.rm(PACK_TEMP_SRC, { recursive: true, force: true });

    log("Clean complete");
}

// ---------- Pack compilation from YAML using foundryvtt-cli ----------

// Split multi-document YAML into one-document-per-file under .pack-src/<packName>
async function prepareYamlPackSourceForFolder(packName, folderName = packName, documentType = "Item") {
    const compFolder = path.join(PACK_SRC, folderName);
    log(`Preparing YAML sources for "${packName}" from ${compFolder}`);

    if (!fs.existsSync(compFolder)) {
        log(`Compendia folder not found for pack "${packName}", skipping.`);
        return 0;
    }

    const packOutDir = path.join(PACK_TEMP_SRC, packName);
    await ensureDir(packOutDir);

    const pattern = path.join(compFolder, "*.yaml").replace(/\\/g, "/");
    const yamlFiles = glob.sync(pattern, { nodir: true });
    log(`  Found ${yamlFiles.length} YAML file(s) for "${packName}".`);

    let docIndex = 0;

    // Map Foundry document type -> collection key prefix used in _key
    const dt = String(documentType || "Item");
    let keyPrefix;
    switch (dt) {
        case "Item":
            keyPrefix = "items";
            break;
        case "Actor":
            keyPrefix = "actors";
            break;
        case "Macro":
            keyPrefix = "macros";
            break;
        default:
            keyPrefix = dt.toLowerCase() + "s";
            break;
    }

    for (const filePath of yamlFiles) {
        const fileContent = await fsp.readFile(filePath, "utf8");

        const docs = yaml.loadAll(fileContent) || [];

        for (const doc of docs) {
            if (!doc || typeof doc !== "object") continue;

            if (!doc.name) continue;

            if (!doc._id) {
                doc._id = makeDeterministicId(packName, doc.name);
            }
            if (!doc._id) continue;

            // Correct _key format: "!<collection>!<id>", e.g. "!items!abcd1234"
            if (!doc._key) {
                doc._key = `!${keyPrefix}!${doc._id}`;
            }
            if (!doc._key) continue;

            // Also set "key" for the CLI / LevelDB
            if (!doc.key) {
                doc.key = doc._key;
            }

            // Give each embedded effect its own key so the CLI can pack it
            if (Array.isArray(doc.effects)) {
                doc.effects = doc.effects.map((eff, idx) => {
                    if (!eff || typeof eff !== "object") return eff;

                    if (!eff._id) {
                        eff._id = makeDeterministicId(`${packName}:${doc.name}`, `effect-${idx}`);
                    }
                    if (!eff._key) {
                        eff._key = `!effects!${eff._id}`;
                    }
                    if (!eff.key) {
                        eff.key = eff._key;
                    }
                    return eff;
                });
            }

            const outFile = path.join(
                packOutDir,
                `${String(docIndex).padStart(4, "0")}.yaml`
            );

            // Force all strings (including _key/key) to be double-quoted
            const yamlText = yaml.dump(doc, {
                noRefs: true,
                lineWidth: -1,
                styles: { "!!str": "double" }
            });

            await fsp.writeFile(outFile, yamlText, "utf8");
            docIndex++;
        }
    }

    log(`Prepared ${docIndex} single-doc YAML file(s) for "${packName}".`);
    return docIndex;
}

async function compilePacks() {
    log("Compiling FoundryVTT packs...");

    // Reset temp YAML source
    await fsp.rm(PACK_TEMP_SRC, { recursive: true, force: true });
    await ensureDir(PACK_TEMP_SRC);

    await ensureDir(PACK_DEST); // base: ./src/packs

    const systemConfig = await loadSystemConfig();
    const packs = Array.isArray(systemConfig.packs) ? systemConfig.packs : [];

    for (const packDef of packs) {
        const packName = packDef.name;
        if (!packName) continue;

        const folderName = packDef.path
            ? path.basename(packDef.path)
            : packName;

        const docType = packDef.type || "Item";
        const numDocs = await prepareYamlPackSourceForFolder(packName, folderName, docType);
        if (!numDocs) {
            log(`No YAML documents for pack "${packName}", skipping compilePack.`);
            continue;
        }

        const srcDir = path.join(PACK_TEMP_SRC, packName);

        const packDestDir = packDef.path
            ? path.join("src", packDef.path)
            : path.join("src", "packs", packName);

        await ensureDir(packDestDir);

        const options = {
            yaml: true,
            log: false        // disable CLI-internal logging
        };

        log(`Packing "${packName}" -> ${packDestDir}`);
        await compilePack(srcDir, packDestDir, options);
    }

    log("Pack compilation complete.");
}

// ---------- watch ----------

function watchUpdates() {
    log("Starting watchers...");

    // SCSS watcher
    chokidar
        .watch("scss/**/*", { ignoreInitial: false })
        .on("all", async (event, filePath) => {
            log(`SCSS change detected (${event}): ${filePath}`);
            try {
                await compileScss();
            } catch (err) {
                handleError(err);
            }
        });

    // Compendia / translations watcher
    chokidar
        .watch("compendia/**/*", { ignoreInitial: false })
        .on("all", async (event, filePath) => {
            log(`Compendia change detected (${event}): ${filePath}`);
            try {
                await createTranslationsBase();
                await compilePacks();
            } catch (err) {
                handleError(err);
            }
        });
}

// ---------- CLI entrypoint ----------

async function main() {
    const cmd = process.argv[2] || "help";

    try {
        switch (cmd) {
            case "build":
                await cleanBuild();
                await compileScss();
                await createTranslationsBase();
                await compilePacks();
                break;
            case "css":
                await compileScss();
                break;
            case "translations":
                await createTranslationsBase();
                break;
            case "packs":
                await compilePacks();
                break;
            case "clean":
                await cleanBuild();
                break;
            case "watch":
                await cleanBuild();
                await compileScss();
                await createTranslationsBase();
                await compilePacks();
                watchUpdates();
                break;
            default:
                console.log("Usage: node build.js <command>");
                console.log("  build          clean + scss + translations + packs");
                console.log("  css            compile scss only");
                console.log("  translations   build translation JSON files");
                console.log("  packs          compile FoundryVTT packs from YAML");
                console.log("  clean          remove src/packs and temp pack sources");
                console.log("  watch          watch scss/compendia and rebuild");
                process.exitCode = 1;
        }
    } catch (err) {
        handleError(err);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    main();
}