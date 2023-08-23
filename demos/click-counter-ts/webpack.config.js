const path = require("path");

const presets = [];

const baseConfig = {
  mode: "development",
  entry: "./src/index.jsx",
  devServer: {
    static: "./",
    hot: true,
    historyApiFallback: true
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: "babel-loader",
          options: {
            presets: presets,
            plugins: [
              "babel-plugin-wallace",
              "@babel/plugin-syntax-jsx",
              "@babel/plugin-proposal-class-properties"
            ],
          }
        }
      ]
    }]
  }
};


module.exports =  function(env, argv) {
  // For some reason env is undefined, so use argv.mode
  const mode = argv.mode || "development";
  baseConfig.mode = mode;
  if (mode == "production") {
    presets.push(productionPreset);
    console.log("MODE=development... Using preset @babel/preset-env.");
  } else {
    console.log("MODE=development... Not using any presets.");
    baseConfig["devtool"] = "eval-source-map"
  }
  return baseConfig
}