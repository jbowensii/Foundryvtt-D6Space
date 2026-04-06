#!/bin/sh

set -e
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
  SYSTEM="${REL}/system.json"
  MANIFEST="${BASE}/0.0.0/system.json"
  OTHER_ZIP="${BASE}/0.0.0/od6s.zip"

  curl --header "JOB-TOKEN: $CI_JOB_TOKEN" --upload-file build/artifacts/od6s.zip "${ZIP}"
  curl --header "JOB-TOKEN: $CI_JOB_TOKEN" --upload-file build/artifacts/od6s.zip "${OTHER_ZIP}"
  curl --header "JOB-TOKEN: $CI_JOB_TOKEN" --upload-file src/system.json "${SYSTEM}"
  curl --header "JOB-TOKEN: $CI_JOB_TOKEN" --upload-file src/system.json "${MANIFEST}"
fi
