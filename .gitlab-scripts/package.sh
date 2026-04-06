#!/bin/bash

set -euo pipefail
set -x

if echo "${CI_COMMIT_TAG}"|grep -E '^(v|rc-|alpha-|beta-)[0-9]+\.[0-9]+\.[0-9]+'; then
  if echo "${CI_COMMIT_TAG}"|grep -E '^v'; then
    BASE="${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/generic/od6s"
  else
    POST="$(echo ${CI_COMMIT_TAG}|sed 's/^\([a-z]*\)-.*/\1/')"
    BASE="${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/generic/od6s-${POST}"
  fi
  VERSION=$(echo "${CI_COMMIT_TAG}" | sed 's/[^0-9.]*\([0-9.]*\).*/\1/')
  REL="${BASE}/${VERSION}"
  ZIP="${REL}/od6s.zip"
  MANIFEST="${BASE}/0.0.0/system.json"
  sed -i "s/\"version\":.*/\"version\": \"${VERSION}\",/" src/system.json
  sed -i "s#\"manifest\":.*#\"manifest\": \"${MANIFEST}\",#" src/system.json
  sed -i "s#\"download\":.*#\"download\": \"${ZIP}\",#" src/system.json
fi

apt-get update -y
apt-get install zip -y
mkdir -p build/artifacts
cp -r src build/od6s
cd build
zip -r artifacts/od6s.zip od6s/
ls -al artifacts
