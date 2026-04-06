const gulp = require('gulp');
const prefix = require('gulp-autoprefixer');
const sass = require('gulp-sass')(require('sass'));
const through2 = require("through2");
const yaml = require("js-yaml");
const { compilePack } = require("@foundryvtt/foundryvtt-cli");
const mergeStream = require("merge-stream");
const clean = require("gulp-clean");
const fs = require("fs");
const path = require("path");
const SYSTEM_SCSS = ["scss/**/*.scss"];
const PACK_SRC = "./compendia";
const jsonFile = require('jsonfile');

/* ----------------------------------------- */
/*  Compile Sass
/* ----------------------------------------- */

// Small error handler helper function.
function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

function compileScss() {
    // Configure options for sass output. For example, 'expanded' or 'nested'
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

async function compilePacks_task() {
    const folders = fs.readdirSync(PACK_SRC).filter((file) => {
        return fs.statSync(path.join(PACK_SRC, file)).isDirectory();
    });

    // The upstream YAML files use multi-document format (--- separators).
    // The Foundry CLI expects one document per file.
    // Split each multi-doc YAML into individual files in a temp directory,
    // then compile with the Foundry CLI.
    const tmpBase = path.join(__dirname, '_tmp_packs');

    for (const folder of folders) {
        const srcDir = path.join(PACK_SRC, folder);
        const tmpDir = path.join(tmpBase, folder);
        const destDir = path.join("src", "packs", folder);

        // Create temp directory for split YAML files
        fs.mkdirSync(tmpDir, { recursive: true });

        // Read and split each YAML file
        const yamlFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.yaml'));
        let docIndex = 0;
        for (const yamlFile of yamlFiles) {
            const content = fs.readFileSync(path.join(srcDir, yamlFile), 'utf8');
            const docs = yaml.loadAll(content);
            for (const doc of docs) {
                if (!doc) continue;
                // Generate a stable filename from the document name or index
                const safeName = (doc.name || `doc_${docIndex}`).replace(/[^a-zA-Z0-9_-]/g, '_');
                const outPath = path.join(tmpDir, `${safeName}_${docIndex}.yaml`);
                fs.writeFileSync(outPath, yaml.dump(doc), 'utf8');
                docIndex++;
            }
        }

        console.log(`Compiling pack: ${folder} (${docIndex} documents)`);
        await compilePack(tmpDir, destDir, { yaml: true });
    }

    // Clean up temp directory
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
