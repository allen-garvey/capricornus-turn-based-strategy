const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',
    entry: [
            `${__dirname}/src/index.js`, 
            `${__dirname}/sass/style.scss`,
        ],
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'public_html/assets'),
    },
    resolve: {
        alias: {
            images: path.resolve(__dirname, 'public_html/images'),
        },
    },
    devServer: {
        contentBase: path.join(__dirname, 'public_html'),
        publicPath: 'http://localhost:3000/assets/',
        port: 3000,
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
                    },
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 5000,
                            fallback: 'file-loader',
                            name: '/images/[name].[ext]',
                        }
                    },
                ]
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '../assets/style.css',
        }),
    ],
};