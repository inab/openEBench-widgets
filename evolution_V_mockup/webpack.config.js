var webpack = require('webpack')
var path = require('path');
var merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

var DEPLOYMENT = process.env.WEBPACK_DEPLOYMENT || 'dev'

var common = {
  entry: './js/OpEB-widgets.js',
  module: {
    loaders: [
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 120000
            }
          }
        ]
      },
    ],
  },
};

if(DEPLOYMENT === 'dev') {
  module.exports = merge(common, {
    output: {
      filename: 'OpEB-widgets.js',
      path: __dirname + '/build'
    },
    devtool: 'eval-source-map',
    devServer: {
      inline: true
    },
    module: {
      // loaders will get concatenated!
      loaders: [
        {
          test: /\.css$/,
          use: [
            { loader: 'style-loader' },
            { loader: 'css-loader',
              options: { minimize: false }
            }
          ]
        }
      ],
    },
  });
}

if(DEPLOYMENT === 'dist') {
  module.exports = merge(common, {
    output: {
      filename: 'OpEB-widgets.js',
      path: __dirname + '/dist'
    },
    module: {
      loaders: [
        {
          test: /\.css$/,
          use: [
            { loader: 'style-loader' },
            { loader: 'css-loader',
              options: { minimize: true }
            }
          ]
        }
      ]
    },
    plugins: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: { warnings: true },
        }
      })
    ]
  });
}
