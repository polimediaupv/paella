const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require("path");

const javascriptRules = {
    test: /\.js$/i,
    exclude: /(node_modules)/,
    use: {
        loader: 'babel-loader',
        options: {
            presets: ['@babel/preset-env']
        }
    }
}

const styleRules = {
    test: /\.css$/i,
    use: ['style-loader', 'css-loader'],
    exclude: /(node_modules)/
}

const imageRules = {
    test: /\.(png|jpe?g|svg|gif)$/i,
    exclude: /(node_modules)/,
    use: [
        {
            loader: 'file-loader'
        }
    ]
}

const plugins = [
    new HtmlWebpackPlugin({
        template: "src/index.html"
    }),
    new CopyWebpackPlugin({
        patterns: [
            { from: 'config', to: 'config' },
            { from: 'repository_test/repository', to: 'repository'}
        ],
    })
]

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'paella-player-[contenthash].js',
        sourceMapFilename: 'paella-player-[contenthash].js.map'
    },
    devtool: "source-map",

    module: {
        rules: [
            javascriptRules,
            styleRules,
            imageRules
        ]
    },
    plugins: plugins,
    resolve: {
        alias: {
            paella: path.resolve(__dirname, "src/js"),
            styles: path.resolve(__dirname, "src/css")
        }
    }
}
