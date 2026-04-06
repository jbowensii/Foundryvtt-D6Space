const gulp = require('gulp');
const prefix = require('gulp-autoprefixer');
const sass = require('gulp-sass')(require('sass'));
const through2 = require("through2");
const yaml = require("js-yaml");
const { compilePack } = require("@foundryvtt/foundryvtt-cli");
const clean = require("gulp-clean");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const SYSTEM_SCSS = ["scss/**/*.scss"];
const PACK_SRC = "./compendia";
const jsonFile = require('jsonfile');

/* ----------------------------------------- */
/*  Compile Sass
/* ----------------------------------------- */

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

function compileScss() {
    let options = {
        outputStyle: 'expanded'
    };
    return gulp.src(SYSTEM_SCSS)
        .pipe(
            sass(options)
                .on('error', handleError)
        )
        .pipe(prefix({
            cascade: false
        }))
        .pipe(gulp.dest("./src/css"))
}

const css = gulp.series(compileScss);

/* ----------------------------------------- */
/*  Create en babele files
/* ----------------------------------------- */
async function createTranslationsBase() {
    const folders = fs.readdirSync(PACK_SRC).filter((file) => {
        return fs.statSync(path.join(PACK_SRC, file)).isDirectory();
    });

    const packs = folders.map((folder) => {
        const jsonPath = 'src/lang/translations/en/od6s.' + folder + '.json';
        let label = folder.replace("-"," ");
        label = label.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

        return gulp.src(path.join(PACK_SRC, folder, "/**/*.yaml")).pipe(
            through2.obj((file, enc, cb) => {
                let json = yaml.loadAll(file.contents.toString());
                let newJson = {
                    "label": label,
                    "mapping": {
                        "description": "system.description"
                    },
                    "entries": {}
                }
                for(let key in json) {
                    const name = json[key].name;
                    const description = json[key].system.description;
                    newJson.entries[name] = {
                        "name": name,
                        "description": description
                    }
                }
                jsonFile.writeFile(jsonPath, newJson,{ spaces: 2, EOL: '\r\n' });
                cb(null, file);
            })
        );
    });
}

/* ----------------------------------------- */
/*  Compile Compendia (LevelDB via Foundry CLI)
/* ----------------------------------------- */

/**
 * Generate a deterministic 16-char hex ID from pack name + document name.
 * This ensures IDs are stable across rebuilds.
 */
function generateId(packName, docName) {
    return crypto.createHash('md5')
        .update(`${packName}/${docName}`)
        .digest('hex')
        .substring(0, 16);
}

// Map folder names to Foundry document types for _key generation
const PACK_TYPES = {};
try {
    const sysJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'system.json'), 'utf8'));
    for (const pack of sysJson.packs) {
        // Map the folder name (from path) to the document type
        const folderName = pack.path.replace('packs/', '');
        PACK_TYPES[folderName] = pack.type.toLowerCase() + 's'; // Item→items, Actor→actors, Macro→macros
    }
} catch (e) { /* system.json not found yet */ }

async function compilePacks_task() {
    const folders = fs.readdirSync(PACK_SRC).filter((file) => {
        return fs.statSync(path.join(PACK_SRC, file)).isDirectory();
    });

    const tmpBase = path.join(__dirname, '_tmp_packs');

    for (const folder of folders) {
        const srcDir = path.join(PACK_SRC, folder);
        const tmpDir = path.join(tmpBase, folder);
        const destDir = path.join("src", "packs", folder);

        fs.mkdirSync(tmpDir, { recursive: true });

        // Determine the document collection type for _key (e.g., "items", "actors", "macros")
        const collectionType = PACK_TYPES[folder] || 'items';

        const yamlFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.yaml'));
        let docIndex = 0;
        for (const yamlFile of yamlFiles) {
            const content = fs.readFileSync(path.join(srcDir, yamlFile), 'utf8');
            const docs = yaml.loadAll(content);
            for (const doc of docs) {
                if (!doc || typeof doc !== 'object') continue;
                if (!doc.name && !doc.type) continue; // Skip empty/invalid documents
                // Generate a stable _id if not present
                if (!doc._id) {
                    doc._id = generateId(folder, doc.name || `doc_${docIndex}`);
                }
                // Add _key field required by Foundry CLI LevelDB compiler
                if (!doc._key) {
                    doc._key = `!${collectionType}!${doc._id}`;
                }
                // Process embedded effects — add _id, _key, and fix label→name
                if (Array.isArray(doc.effects)) {
                    for (let ei = 0; ei < doc.effects.length; ei++) {
                        const effect = doc.effects[ei];
                        if (!effect._id) {
                            effect._id = generateId(folder, `${doc.name}_effect_${ei}`);
                        }
                        if (!effect._key) {
                            effect._key = `!${collectionType}.effects!${doc._id}.${effect._id}`;
                        }
                        // Migrate ActiveEffect label → name (label removed in v13)
                        if (effect.label && !effect.name) {
                            effect.name = effect.label;
                            delete effect.label;
                        }
                    }
                }
                const safeName = (doc.name || `doc_${docIndex}`).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 60);
                // Use .yml extension (required by Foundry CLI)
                const outPath = path.join(tmpDir, `${safeName}_${String(docIndex).padStart(4, '0')}.yml`);
                fs.writeFileSync(outPath, yaml.dump(doc), 'utf8');
                docIndex++;
            }
        }

        console.log(`Compiling pack: ${folder} (${docIndex} ${collectionType})`);
        if (docIndex > 0) {
            try {
                await compilePack(tmpDir, destDir, { yaml: true });
            } catch (e) {
                console.error(`  ERROR compiling ${folder}: ${e.message}`);
                // List problematic files
                const tmpFiles = fs.readdirSync(tmpDir);
                for (const tf of tmpFiles) {
                    const content = fs.readFileSync(path.join(tmpDir, tf), 'utf8');
                    if (!content.includes('_key:') || !content.includes('_id:')) {
                        console.error(`  Missing _key or _id in ${tf}`);
                    }
                }
                throw e;
            }
        } else {
            fs.mkdirSync(destDir, { recursive: true });
        }
    }

    fs.rmSync(tmpBase, { recursive: true, force: true });
}

function watchUpdates() {
    gulp.watch("scss/**/*", gulp.series(compileScss));
    gulp.watch("compendia/**/*", gulp.series(cleanBuild, compilePacks_task, createTranslationsBase));
}

function cleanBuild() {
    return gulp.src(`src/packs`, { allowEmpty: true }, { read: false }).pipe(clean());
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.build = gulp.series(cleanBuild, compileScss, compilePacks_task, createTranslationsBase);
exports.default = gulp.series(cleanBuild, compileScss, compilePacks_task, createTranslationsBase, watchUpdates);
exports.css = css;
