#!/usr/bin/env bash

rm -rf dist artifacts
mkdir dist artifacts

cp src/icons/* dist

if [[ "$NODE_ENV" = "FIREFOX" ]]
then
  cp src/manifest-firefox.json dist/manifest.json
else
  cp src/manifest.json dist/manifest.json
fi

parcel build src/browser_action/index.html src/content_scripts/main.js src/background/index.html --out-dir dist/  --no-source-maps 

web-ext lint -s dist/

linterReturnCode=$?
if [ $linterReturnCode -ne 0 ]; then
  exit $retVal
fi

cd dist
zip -r ../artifacts/$npm_package_name-$npm_package_version-$NODE_ENV.zip .

if [[ "$NODE_ENV" = "FIREFOX" ]]
then
  cd ..
  git archive -o artifacts/$npm_package_name-$npm_package_version-source.zip HEAD
fi

