module.exports = {
    root: true,
    extends: ['airbnb-base', 'loose-airbnb'],
    env: {
        browser: true,
        node: true,
        jest: true,
        es6: true,
    },
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 7,
        ecmaFeatures: {
            classes: true,
            modules: true,
            jsx: true
        }
    },
    rules: {
        semi: ['warn', 'never'],
        'import/no-extraneous-dependencies': 0,
    }
}
