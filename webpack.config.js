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
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          //'url-loader?limit=130000',
          'url-loader',
          {
            loader: 'img-loader',
            options: {
              enabled: DEPLOYMENT === 'dist',
              gifsicle: {
                interlaced: false
              },
              mozjpeg: {
                progressive: true,
                arithmetic: false
              },
              optipng: false, // disabled
              pngquant: {
                floyd: 0.5,
                speed: 2
              },
              svgo: {
                plugins: [
                  { removeTitle: true },
                  { convertPathData: false }
                ]
              }
            }
          }
        ]
      }
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
            },
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
      library: 'OpEB_widgets',
      libraryTarget: "this",
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
        },
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

if(DEPLOYMENT === 'dist-compat') {
  module.exports = merge(common, {
    output: {
      filename: 'OpEB-widgets-compat.js',
      library: 'OpEB_widgets',
      libraryTarget: 'window',
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
        },
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
