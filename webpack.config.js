const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const nodeExternals = require('webpack-node-externals');
const ClosureCompilerPlugin = require('webpack-closure-compiler');
// const ExtractTextPlugin = require("extract-text-webpack-plugin");
// const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

require('dotenv').config();

const PROD_ENV = process.env.NODE_ENV === "production";
const INLINE = process.env.NODE_INLINE === "true";
const PATHS = {
    src: path.join(__dirname, "src"),
    build: path.join(__dirname, "build")
};


let plugins = [new HtmlWebpackPlugin({
        title: "Webpack demo",
        template: path.join(PATHS.src, "hbs", "index.hbs"),
        filename: path.join(PATHS.build, "public", "index.html"),
        minify: PROD_ENV ? {
            removeAttributeQuotes: true,
            collapseWhitespace: true,
            html5: true,
            minifyCSS: true,
            removeComments: true,
            removeEmptyAttributes: true,
        } : false,
    }),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(`${process.env.NODE_ENV}`),
        'process.env.NODE_INLINE': JSON.stringify(`${process.env.NODE_INLINE}`),
        'WEBPACK_BUILD_DATE': JSON.stringify(new Date().toLocaleString()),
        'WEBPACK_GIT_REPO': JSON.stringify('https://github.com/theBrianCui/IsMyInternetWorking'),
        'PAGE_BASE_TITLE': JSON.stringify('Is My Internet Working?'),
    })
,

    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    })];

if (PROD_ENV) {
    plugins.push(new ClosureCompilerPlugin({
        compiler: {
            language_in: 'ECMASCRIPT6',
            language_out: 'ECMASCRIPT5_STRICT',
            compilation_level: 'SIMPLE'
        },
        jsCompiler: true,
    }));
    // plugins.push(new ExtractTextPlugin('style.css'));
}

if (INLINE) {
    // plugins.push(new ScriptExtHtmlWebpackPlugin({
    //     inline: "static/app.js",
    // }));
};

module.exports = [
    {
        name: "app",
        target: "web",
        resolve: {
            alias: {
                "request$": "xhr"
            },
        },
        entry: path.join(PATHS.src, "app.js"),
        module: {
            rules: [
                 {
        test: /\.s?css$/,
        use: [
          PROD_ENV && !INLINE ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'sass-loader'
        ].filter(Boolean), // filters out false values
      },
                {
                    test: /\.hbs$/,
                    use: "handlebars-loader",
                }
            ],
        },
        output: {
            path: path.join(PATHS.build, "public", "static"),
            publicPath: "/static/",
            filename: "app.js",
        },
        plugins: plugins,
    },
    {
        name: "server",
        target: "node",
        entry: path.join(PATHS.src, "server.js"),
        externals: [nodeExternals()],
        node: {
            __dirname: false,
            __filename: false,
        },
        output: {
            path: path.join(PATHS.build),
            filename: "server.js",
        },
    },
    
];