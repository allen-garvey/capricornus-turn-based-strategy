const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',
    entry: [
            `${__dirname}/js_src/index.js`, 
            // `${__dirname}/sass/style.scss`,
        ],
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'public_html/js'),
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            outputStyle: 'compressed',
                        },
                    },
                ]
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '../css/style.css',
        }),
    ],
};