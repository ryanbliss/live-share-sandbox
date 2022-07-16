export const ReactIndexJs = `
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
 document.getElementById('root')
);
`;

export const PackageJson = `
{
  "name": "live-share-sandbox",
  "main": "/index.js",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "start": "webpack-dev-server --config webpack.config.js",
    "build": "webpack --config webpack.prod.js",
    "test": "jest",
    "doctor": "eslint ./src/**/*.ts{,x} --fix",
  },
  "dependencies": {
    "@microsoft/live-share": "~0.3.1",
    "@microsoft/live-share-media": "~0.3.1",
    "@microsoft/teams-js": "2.0.0-experimental.0",
    "fluid-framework": "~0.59.0",
    "lodash": "^4.17.21",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-scripts": "^5.0.0"
  },
  devDependencies: {
    "@babel/core": "^7.17.8",
    "@babel/node": "^7.16.8",
    "@babel/plugin-proposal-class-properties": "^7.16.7",
    "@babel/preset-env": "^7.16.11",
    "@babel/preset-react": "^7.16.7",
    "@babel/preset-typescript": "^7.16.7",
    "@fluidframework/test-client-utils": "^0.54.2",
    "@fluidframework/tinylicious-client": "^0.58.1000",
    "babel-jest": "^27.5.1",
    "babel-loader": "^8.2.4",
    "css-loader": "^6.7.1",
    "eslint": "^7.32.0",
    "eslint-config-prettier": "^8.3.0",
    "eslint-plugin-prettier": "^3.4.1",
    "eslint-plugin-storybook": "^0.5.11",
    "file-loader": "^6.2.0",
    "html-webpack-plugin": "^5.5.0",
    "image-webpack-loader": "^8.1.0",
    "jest": "^27.5.1",
    "mini-css-extract-plugin": "^2.6.0",
    "node-polyfill-webpack-plugin": "^1.1.4",
    "node-sass": "^7.0.1",
    "path": "^0.12.7",
    "prettier": "^2.5.0",
    "react-test-renderer": "^17.0.2",
    "source-map-loader": "^3.0.1",
    "start-server-and-test": "^1.11.6",
    "ts-loader": "^9.2.8",
    "typescript": "^4.6.3",
    "url-loader": "^4.1.1",
    "webpack": "^5.71.0",
    "webpack-bundle-analyzer": "^4.5.0",
    "webpack-cli": "^4.9.2",
    "webpack-dev-server": "^4.7.4",
    "webpack-merge": "^5.8.0"
  }
}
`;

export const WebpackConfig = `
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    app: "./src/index.tsx",
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].[contenthash:8].js",
    sourceMapFilename: "[name].[contenthash:8].map",
    chunkFilename: "[id].[contenthash:8].js",
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: "babel-loader",
          options: {
            babelrc: false,
            configFile: false,
            presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
            plugins: ["@babel/plugin-proposal-class-properties"],
            include: [path.resolve("@fluidframework/server-services-client/dist")],
            exclude: /node_modules\/(?!@fluidframework).+/,
          },
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ["ts-loader"],
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|mp3|svg)$/,
        use: ["file-loader"],
      },
      {
        test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "[name].[ext]",
        },
      },
    ],
  },
  ignoreWarnings: [/Failed to parse source map/],
  plugins: [
    new NodePolyfillPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
      ignoreOrder: false,
    }),
    new HtmlWebpackPlugin({
      title: "Microsoft Teams - YouTube Tab",
      template: path.join(__dirname, "public", "index.html"),
    }),
  ],
};
`;