const { build } = require('esbuild')
const { nodeExternalsPlugin } = require('esbuild-node-externals')
const { Generator } = require('npm-dts')
const { dependencies, peerDependencies } = require('./package.json')

new Generator({
  entry: 'src/index.ts',
  output: 'dist/index.d.ts'
}).generate()

const sharedConfig = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: false,
  external: Object.keys(dependencies || {}).concat(Object.keys(peerDependencies || {})),
  plugins: [
		nodeExternalsPlugin()
	]
}

build({
  ...sharedConfig,
  platform: 'node', // for CJS
  outfile: "dist/index.js"
}).catch(() => process.exit(1))

build({
  ...sharedConfig,
  outfile: "dist/index.esm.js",
  platform: 'neutral', // for ESM
  format: "esm"
}).catch(() => process.exit(1))

