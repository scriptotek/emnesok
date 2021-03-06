'use strict';

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
require('dotenv').config();

const dest = path.join(__dirname, '../dist');

module.exports = merge(common, {
    devtool: 'cheap-eval-source-map',
    devServer: {
        clientLogLevel: 'error',
        // contentBase: dest,
        // publicPath: '/',
        // inline: true,
        // hot: true,
        historyApiFallback: true,
        // disableDotRule: true,
    },
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
