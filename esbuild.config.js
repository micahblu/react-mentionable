const { build } = require('esbuild')
const InlineCSSPlugin = require('esbuild-plugin-inline-css')
const { nodeExternalsPlugin } = require('esbuild-node-externals')
const { Generator } = require('npm-dts')

new Generator({
  entry: 'src/index.ts',
  output: 'dist/index.d.ts'
}).generate()

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
	format: 'esm',
	target: 'chrome79',
	plugins: [
		InlineCSSPlugin(),
		nodeExternalsPlugin()
	]
}).catch(() => process.exit(1))
