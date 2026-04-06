const gulp = require('gulp');
const prefix = require('gulp-autoprefixer');
const sass = require('gulp-sass')(require('sass'));
const through2 = require("through2");
const yaml = require("js-yaml");
const Datastore = require("@seald-io/nedb");
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
/*  Compile Compendia
/* ----------------------------------------- */

async function compilePacks() {
    // determine the source folders to process
    const folders = fs.readdirSync(PACK_SRC).filter((file) => {
        return fs.statSync(path.join(PACK_SRC, file)).isDirectory();
    });

    // process each folder into a compendium db
    const packs = folders.map((folder) => {
        const db = new Datastore({ filename: path.resolve(__dirname, 'src', "packs", `${folder}.db`), autoload: true });
        return gulp.src(path.join(PACK_SRC, folder, "/**/*.yaml")).pipe(
            through2.obj((file, enc, cb) => {
                let json = yaml.loadAll(file.contents.toString());
                db.insert(json);
                cb(null, file);
            })
        );
    });
    return mergeStream.call(null, packs);
}

function watchUpdates() {
    gulp.watch("scss/**/*", gulp.series(compileScss));
    gulp.watch("compendia/**/*", gulp.series(cleanBuild,compilePacks,createTranslationsBase));
}

function cleanBuild() {
    return gulp.src(`src/packs`, { allowEmpty: true }, { read: false }).pipe(clean());
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.build = gulp.series(cleanBuild, compileScss, compilePacks, createTranslationsBase);
exports.default = gulp.series(cleanBuild,compileScss, compilePacks, createTranslationsBase, watchUpdates);
exports.css = css;
