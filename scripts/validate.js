// prevent common errors before build

/** validate matching version numbers in package and manifest */

const pkg = require('../package.json')
const manifest = require('../src/manifest')

if (pkg.version !== manifest.version) {
  console.log('Error: version code mismatch between package and manifest.')
  process.exit(1)
}

const browsers = ['FIREFOX', 'CHROME', 'EDGE']
if (!browsers.includes(process.env.NODE_ENV)) {
  console.log('Error: NODE_ENV should be set properly for ENV replacement.')
  process.exit(1)
}