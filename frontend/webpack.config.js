/* eslint-disable */
var path = require('path');
var webpack = require('webpack');

var isProduction = process.env.NODE_ENV === 'production';

var r = path.resolve;
var BASE_DIR = r(__dirname);
var BUILD_DIR = r(BASE_DIR, 'lib');
var SRC_DIR = r(BASE_DIR, 'src');

var entrypoint = function(source) {
  if (isProduction) {
    return source;
  }
  return [
    'react-hot-loader/patch',
    'webpack/hot/only-dev-server',
    'webpack-dev-server/client?http://0.0.0.0:3000',
  ].concat(source);
}

module.exports = {
  entry: {
    index: entrypoint([
      'babel-polyfill',
      'isomorphic-fetch',
      'bootstrap-loader',
      r(SRC_DIR, 'index.js'),
    ]),
  },
  output: {
    path: BUILD_DIR,
    publicPath: '/lib/',
    filename: '[name].bundle.js',
    library: '[name]',
    libraryTarget: 'var'
  },
  devServer: {
    contentBase: BASE_DIR,
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 3000,
    hot: true,
    inline: true,
    historyApiFallback: true,
    watchOptions: {
      poll: true
    }
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  devtool: isProduction ? 'cheap-module-source-map' : 'eval',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
         NODE_ENV: JSON.stringify(isProduction ? 'production' : 'development')
       }
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
      Tether: "tether",
      Popper: "popper.js",
      "window.Tether": "tether",
      Alert: "exports-loader?Alert!bootstrap/js/dist/alert",
      Button: "exports-loader?Button!bootstrap/js/dist/button",
      Carousel: "exports-loader?Carousel!bootstrap/js/dist/carousel",
      Collapse: "exports-loader?Collapse!bootstrap/js/dist/collapse",
      Dropdown: "exports-loader?Dropdown!bootstrap/js/dist/dropdown",
      Modal: "exports-loader?Modal!bootstrap/js/dist/modal",
      Popover: "exports-loader?Popover!bootstrap/js/dist/popover",
      Scrollspy: "exports-loader?Scrollspy!bootstrap/js/dist/scrollspy",
      Tab: "exports-loader?Tab!bootstrap/js/dist/tab",
      Tooltip: "exports-loader?Tooltip!bootstrap/js/dist/tooltip",
      Util: "exports-loader?Util!bootstrap/js/dist/util",
    }),
  ],
  module: {
    loaders: [
      { test: /\.(jsx|js)$/, loader: 'babel-loader', include: SRC_DIR },
      // {
      //   test: /\.css$/,
      //   use: [
      //     'style-loader',
      //     'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]__[hash:base64:5]',
      //     'postcss-loader',
      //   ],
      // },
      // {
      //   test: /\.scss$/,
      //   use: [
      //     'style-loader',
      //     'css-loader?modules&importLoaders=2&localIdentName=[name]__[local]__[hash:base64:5]',
      //     'postcss-loader',
      //     'sass-loader',
      //   ],
      // },
      // {
      //   test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      //   use: 'url-loader?limit=10000',
      // },
      // {
      //   test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
      //   use: 'file-loader',
      // },
      // { test: /\.css$/, loader: 'style!css!' },
      // { test: /\.json$/, loader: 'json' },
    ]
  }
}
