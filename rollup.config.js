import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify'

const env = process.env.NODE_ENV
const _exports = 'named'
const config = {
    input: 'src/index.js',
    plugins: [],
    external: ['redux', 'redux-saga'],
    globals: {
        redux: 'Redux',
        'redux-saga': 'ReduxSaga',
    }
}

if (env === 'es' || env === 'cjs') {
    config.output = { format: env, exports: _exports }
    config.plugins.push(babel({
        plugins: ['external-helpers']
    }))
}

if (env === 'development' || env === 'production') {
    config.output = { format: 'umd', exports: _exports }
    config.name = 'Redurex'
    config.plugins.push(
        nodeResolve({
            jsnext: true
        }),
        babel({
            exclude: 'node_modules/**',
            plugins: ['external-helpers']
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(env)
        })
    )
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
