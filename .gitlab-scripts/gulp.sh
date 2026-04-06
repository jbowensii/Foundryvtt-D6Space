#!/bin/bash

set -euo pipefail
set -x 

#npm install --global gulp-cli
#npm init --yes
#npm install --save-dev jsonfile gulp gulp-autoprefixer gulp-sass through2 js-yaml nedb merge-stream gulp-clean

npm link gulp
npm link gulp-autoprefixer
npm link gulp-clean
npm link gulp-ci
npm link gulp-sass
npm link js-yaml
npm link merge-stream
npm link nedb
npm link sass
npm link through2
npm link jsonfile

gulp --version
gulp build

