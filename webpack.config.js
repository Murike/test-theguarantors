const nodeExternals = require('webpack-node-externals');

module.exports = function (options){
    return {
        ...options,
        entry: './src/main.ts',
        mode: 'production',
        target: 'node',
        externals: [
            nodeExternals({
                allowlist: [
                    /^(?!.*node_modules)/,
                ],
            }),
        ],
        output: {
            ...options.output,
            filename: 'main.js',
        },
        optimization: {
            minimize: false,
        }
    }
}