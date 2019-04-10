'use strict';
require('dotenv').config();

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const dest = path.join(__dirname, '../dist');

const sourcePath = path.resolve(__dirname, '../src');

module.exports = {
    mode: process.env.NODE_ENV,
    output: {
        publicPath: process.env.BASE_HREF,
    },
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
        filename: '[name].[chunkhash].bundle.js',
    },
    plugins: [
        new CleanWebpackPlugin([dest], { root: path.resolve(__dirname, '..') }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/app/index.ejs'),
            base: process.env.BASE_HREF,
            GA_IPP: process.env.GA_IPP,
            GA_ID: process.env.GA_ID,
            GA_URL: process.env.GA_URL,
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

            // https://github.com/vsternbach/angularjs-typescript-webpack
            {
              test: /\.ts$/,
              exclude: /node_modules/,
              use: [
                {
                  loader: 'ng-annotate-loader',
                  options: {
                    ngAnnotate: 'ng-annotate-patched',
                    sourcemap: true // !isProd,
                  },
                },
                {
                  loader: 'ts-loader',
                  options: {
                    // configFile: sourcePath + '/tsconfig.app.json',
                    // disable type checker - we will use it in fork plugin
                    transpileOnly: true,
                  }
                }
              ]
            },
        ]
    }
};
