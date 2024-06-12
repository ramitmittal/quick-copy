#!/usr/bin/env bash

rm -rf dist
mkdir dist

cp -r src/manifest.json src/icons/* dist

parcel watch src/browser_action/index.html src/content_scripts/main.js src/background/main.js --dist-dir dist/ &
parcelProcess=$!

sleep 3

web-ext run -s dist/ -t chromium &

webextProcess=$!

wait $parcelProcess $webextProcess
