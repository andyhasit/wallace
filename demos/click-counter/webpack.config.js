const path = require("path");

const presets = [];
const productionPreset = '@babel/preset-env';

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
      test: /\.[jt]sx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: "babel-loader",
        }
      ]
    }]
  }
};


module.exports =  function() {
  const mode = process.env.NODE_ENV || "development";
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