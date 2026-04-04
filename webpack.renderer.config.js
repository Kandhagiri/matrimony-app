const rules = require('./webpack.rules');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

// Custom plugin to inject __dirname and __filename as globals
class DirnamePolyfillPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('DirnamePolyfillPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'DirnamePolyfillPlugin',
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          for (const [filename, asset] of Object.entries(assets)) {
            if (filename.endsWith('.js')) {
              const source = asset.source();
              // Inject at the very beginning of the bundle
              const newSource = `
                if (typeof __dirname === 'undefined') {
                  var __dirname = '/';
                }
                if (typeof __filename === 'undefined') {
                  var __filename = 'index.html';
                }
              ` + source;
              compilation.updateAsset(filename, new webpack.sources.RawSource(newSource));
            }
          }
        }
      );
    });
  }
}

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push({
  test: /\.(js|jsx)$/,
  exclude: [
    /node_modules/,
    /pramukhime\.js$/  // Don't process pramukhime.js with babel
  ],
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        ['@babel/preset-env', { targets: { electron: '38' } }],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ],
    },
  },
});

// Custom plugin to copy JS files after webpack compilation
class CopyJSFilesPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('CopyJSFilesPlugin', (compilation, callback) => {
      const fs = require('fs');
      const path = require('path');
      
      // Electron Forge outputs to .webpack/renderer/main_window/
      const outputDir = path.resolve(__dirname, '.webpack/renderer/main_window/js');
      const sourceDir = path.resolve(__dirname, 'public/js');
      const outputRoot = path.resolve(__dirname, '.webpack/renderer/main_window');
      const iconSrc = path.resolve(__dirname, 'public/icon.png');
      const iconDest = path.resolve(outputRoot, '@icon.png');
      const icoSrc = path.resolve(__dirname, 'public/icon.ico');
      const icoDest = path.resolve(outputRoot, 'icon.ico');
      
      // Ensure output directory exists
      if (!fs.existsSync(outputRoot)) {
        fs.mkdirSync(outputRoot, { recursive: true });
      }
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Copy function
      const copyRecursiveSync = (src, dest) => {
        const exists = fs.existsSync(src);
        const stats = exists && fs.statSync(src);
        const isDirectory = exists && stats.isDirectory();
        
        if (isDirectory) {
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(
              path.join(src, childItemName),
              path.join(dest, childItemName)
            );
          });
        } else {
          fs.copyFileSync(src, dest);
        }
      };
      
      try {
        // Copy entire js directory
        copyRecursiveSync(sourceDir, outputDir);
        console.log(`✅ Copied JS files from ${sourceDir} to ${outputDir}`);
        // Copy icon if present
        if (fs.existsSync(iconSrc)) {
          fs.copyFileSync(iconSrc, iconDest);
          console.log(`✅ Copied app icon from ${iconSrc} to ${iconDest}`);
        } else {
          console.warn(`⚠️ App icon not found at ${iconSrc}`);
        }
        // Copy Windows .ico if present
        if (fs.existsSync(icoSrc)) {
          fs.copyFileSync(icoSrc, icoDest);
          console.log(`✅ Copied Windows icon from ${icoSrc} to ${icoDest}`);
        }
      } catch (error) {
        console.error('❌ Error copying JS files:', error);
      }
      
      callback();
    });
  }
}

module.exports = (env, argv) => {
  // Electron Forge webpack plugin outputs to .webpack/renderer/main_window/
  // We need to copy files there, but we need to detect the output path
  // Since Electron Forge controls this, we'll use a relative path that webpack resolves
  const outputPath = path.resolve(__dirname, '.webpack/renderer/main_window');
  
  return {
    // Put your normal webpack config below here
    module: {
      rules,
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      fallback: {
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
      }
    },
    externals: {
      'better-sqlite3': 'commonjs better-sqlite3',
      'sharp': 'commonjs sharp',
       'fs': 'commonjs fs',
      'path': 'commonjs path'
    },
    optimization: {
      minimize: false,
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      // Use custom plugin instead of CopyWebpackPlugin
      new CopyJSFilesPlugin(),
      new webpack.DefinePlugin({
        '__dirname': JSON.stringify('/'),
        '__filename': JSON.stringify('index.html'),
      }),
      new DirnamePolyfillPlugin(),
    ],
  };
};
