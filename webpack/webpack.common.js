'use strict';

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const dest = path.join(__dirname, '../dist');

module.exports = {
    entry: {
        polyfills: path.resolve(__dirname, './polyfills'),
        app: path.resolve(__dirname, '../src/app/index'),
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    output: {
        path: dest,
        publicPath: '/ub/emnesok/',
        filename: '[name].[chunkhash].bundle.js',
    },
    plugins: [
        new CleanWebpackPlugin([dest], { root: path.resolve(__dirname, '..') }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/app/index.ejs')
        }),
        // new BundleAnalyzerPlugin(),
    ],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, '../src/app')
        }
    },
    module: {
        rules: [
            {
                test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        // Note: [hash] in the context of file-loader is the MD5 hash of the file contents.
                        name: 'assets/[name].[hash].[ext]'
                    }
                }
            },
            {
                test: /\.html$/,
                use: [
                    // {
                    //     loader: 'file-loader',
                    //     options: {
                    //         name: '[path][name].[ext]',
                    //     },
                    // },
                    // {
                    //     loader: 'extract-loader',
                    //     options: {
                    //         publicPath: '../',
                    //     }
                    // },
                    {
                        loader: 'html-loader',
                        options: {
                            attrs: ['img:src', 'div:template-url'],
                        }
                    },
                ],
                //'file-loader?name=[path][name].[ext]!extract-loader!html-loader' ],
                // use: {
                //     loader: 'html-loader',
                //     options: {
                //         // root: 'assets',
                //         attrs: ['img:src', 'div:template-url'],
                //     }
                // }
            },
            {
                test: /\.ejs$/,
                use: 'ejs-loader',
            },
        ]
    }
};
