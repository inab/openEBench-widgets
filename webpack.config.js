var webpack = require('webpack');
var path = require('path');
var merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var DEPLOYMENT = process.env.WEBPACK_DEPLOYMENT || 'dev';

var common = {
  entry: './js/OpEB-widgets.js',
  resolve: {
    modules: [path.resolve(__dirname, "widget_modules"), "node_modules"]
  },
  module: {
    rules: [{
      test: /\.(jpe?g|png|gif|svg)$/i,
      use: [
        //'url-loader?limit=130000',
        'url-loader',
        {
          loader: 'img-loader',
          options: {
            enabled: (DEPLOYMENT === 'dist' || DEPLOYMENT === 'dist-compat'),
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
              plugins: [{
                  removeTitle: true
                },
                {
                  convertPathData: false
                }
              ]
            }
          }
        }
      ]
    }],
  },
};

if (DEPLOYMENT === 'dev') {
  module.exports = merge(common, {
    mode: 'development',
    output: {
      filename: 'OpEB-widgets.js',
      path: __dirname + '/dev'
    },
    devtool: 'eval-source-map',
    devServer: {
      inline: true
    },
    module: {
      // rules will get concatenated!
      rules: [{
        test: /\.css$/,
        use: [{
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              minimize: false
            }
          },
        ]
      }],
    },
  });
} else if (DEPLOYMENT === 'dev-compat') {
  module.exports = merge(common, {
    mode: 'development',
    output: {
      filename: 'OpEB-widgets-compat.js',
      library: 'OpEB_widgets',
      libraryTarget: 'window',
      path: __dirname + '/dev'
    },
    devtool: 'eval-source-map',
    devServer: {
      inline: true
    },
    module: {
      rules: [{
        test: /\.css$/,
        use: [{
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              minimize: false
            }
          }
        ]
      }]
    },
  });
} else if (DEPLOYMENT === 'dist') {
  module.exports = merge(common, {
    mode: 'production',
    output: {
      filename: 'OpEB-widgets.js',
      library: 'OpEB_widgets',
      libraryTarget: "this",
      path: __dirname + '/dist'
    },
    module: {
      rules: [{
        test: /\.css$/,
        use: [{
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              minimize: true
            }
          }
        ]
      }]
    },
    plugins: [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            warnings: true
          },
        }
      }),
    ]
  });
} else if (DEPLOYMENT === 'dist-compat') {
  module.exports = merge(common, {
    mode: 'production',
    output: {
      filename: 'OpEB-widgets-compat.js',
      library: 'OpEB_widgets',
      libraryTarget: 'window',
      path: __dirname + '/dist'
    },
    module: {
      rules: [{
        test: /\.css$/,
        use: [{
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              minimize: true
            }
          }
        ]
      }]
    },
    plugins: [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            warnings: true
          },
        }
      })
    ]
  });
}