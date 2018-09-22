'use strict';

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    stats: 'errors-only',
    optimization: {
        minimize: true
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.BASE_HREF': JSON.stringify('/ub/emnesok/'),
            'process.env.GA_URL': JSON.stringify('//vrtx.uio.no/js/analytics/v2/analytics.js'),
            'process.env.GA_IPP': JSON.stringify('useIppProxy()'),
            'process.env.GA_ID': JSON.stringify('UA-72054416-3'),
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        // compiling mode “scope hoisting”
        new webpack.optimize.ModuleConcatenationPlugin(),
        new MiniCssExtractPlugin({
            filename: 'bundle.css'
        })
    ],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, '../src/app')
        }
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /(node_modules|bower_components)/,
                use: 'babel-loader'
            },
            {
                test: /\.s?css/i,
                use : [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    }
});
