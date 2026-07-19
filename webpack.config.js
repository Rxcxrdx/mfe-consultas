const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { ModuleFederationPlugin } = webpack.container;

module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production';
  const apiUrl = process.env.API_URL || 'http://localhost:3001';

  return {
    entry: './src/index.ts',
    mode: isProduction ? 'production' : 'development',
    devServer: {
      port: 3002,
      historyApiFallback: true,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: 'auto',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: { transpileOnly: true },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.API_URL': JSON.stringify(apiUrl),
      }),
      new ModuleFederationPlugin({
        name: 'consultas',
        filename: 'remoteEntry.js',
        exposes: {
          './ConsultaSaldo': './src/components/ConsultaSaldo',
        },
        shared: {
          react: { singleton: true, requiredVersion: false },
          'react-dom': { singleton: true, requiredVersion: false },
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        excludeChunks: ['consultas'],
      }),
    ],
  };
};
