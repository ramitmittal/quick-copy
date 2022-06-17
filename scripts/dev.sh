#!/usr/bin/env bash

rm -rf dist
mkdir dist

cp -r src/icons/* dist

if [[ "$NODE_ENV" = "FIREFOX" ]]
then
  cp src/manifest-firefox.json dist/manifest.json
else
  cp src/manifest.json dist/manifest.json
fi

parcel watch src/browser_action/index.html src/content_scripts/main.js src/background/index.html --dist-dir dist/ &
parcelProcess=$!

sleep 3

if [[ "$NODE_ENV" = "FIREFOX" ]]
then
  web-ext run -s dist/ &
else
  web-ext run -s dist/ -t chromium &
fi

webextProcess=$!

wait $parcelProcess $webextProcess
