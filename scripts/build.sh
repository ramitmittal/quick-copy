#!/usr/bin/env bash

rm -rf dist artifacts
mkdir dist artifacts

cp src/icons/* dist
cp src/manifest.json dist/manifest.json

parcel build src/browser_action/index.html src/content_scripts/main.js src/background/main.js --dist-dir dist/  --no-source-maps

web-ext lint -s dist/

cd dist
zip -r ../artifacts/$npm_package_name-$npm_package_version-$NODE_ENV.zip .
