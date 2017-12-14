import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify'

const env = process.env.NODE_ENV

const config = {
    name: 'Redurex',
    input: 'src/index.js',
    output: {
        format: 'umd',
        exports: 'named',
    },
    plugins: [
        nodeResolve({
            jsnext: true
        }),
        commonjs({
            include: 'node_modules/**',
        }),
        babel({
            exclude: 'node_modules/**',
            runtimeHelpers: true
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(env)
        })
    ],
    external: ['redux', 'redux-saga'],
    globals: {
        redux: 'Redux',
        'redux-saga': 'ReduxSaga',
    }
}

if (env === 'production') {
    config.plugins.push(uglify({
        compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false
        }
    }))
}

export default config
