import json from '@rollup/plugin-json'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodeExternals from 'rollup-plugin-node-externals'

export default {
	input: 'src/pipeline.mjs',
	output: [
    { format: 'es', file: 'dist/pipeline.mjs' },
    { format: 'cjs', file: 'dist/pipeline.cjs' }
  ],
  plugins: [
    json(),
    nodeExternals({ deps: false }), // Must always be before `nodeResolve()`.
    nodeResolve(),
    babel({ babelHelpers: 'bundled' }),
    commonjs()
  ]
};