'use strict';

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const dest = path.join(__dirname, '../dist');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'cheap-eval-source-map',
    devServer: {
        // contentBase: dest,
        // publicPath: '/',
        // inline: true,
        // hot: true,
        historyApiFallback: true,
        // disableDotRule: true,
    },
    plugins: [
        // new CopyWebpackPlugin([
        //     { from: path.resolve(__dirname, '../public'), to: 'public' }
        // ]),
        new webpack.DefinePlugin({
            'process.env.BASE_HREF': JSON.stringify('/'),
            'process.env.GA_URL': JSON.stringify(''),
            'process.env.GA_IPP': JSON.stringify(''),
            'process.env.GA_ID': JSON.stringify(''),
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ],
    module: {
        rules: [
            {
                test: /\.(js)$/,
                include: path.resolve(__dirname, '../src/app'),
                enforce: 'pre',
                loader: 'eslint-loader',
                options: {
                    emitWarning: true,
                }
            },
            {
                test: /\.(js)$/,
                include: path.resolve(__dirname, '../src/app'),
                loader: 'babel-loader'
            },
            {
                test: /\.s?css$/i,
                use: ['style-loader', 'css-loader?sourceMap=true', 'sass-loader']
            }
        ]
    }
});
