const path = require('path');

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.join(__dirname, "dist"),
		filename: 'paella-external-plugin',
        library: 'paella-external-plugin',
        libraryTarget: 'umd'
	},
	externals: {
        paella: {
            commonjs: 'paella',
            commonjs2: 'paella',
            amd: 'paella'
        }
    },
	
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
			{
				test: /\.(svg)$/i,
				exclude: /(node_modules)/,
				use: [
					{
						loader: 'svg-inline-loader'
					}
				]
			}
		]
	},
	
	plugins: [
	]
}