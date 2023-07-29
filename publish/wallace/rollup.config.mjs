// import babel from "@rollup/plugin-babel";
// import commonjs from '@rollup/plugin-commonjs';

export default {
  input: "src/index.js",
  output: {
    file: "dist/wallace.js",
    format: "es"
  },
  plugins: [
    // commonjs(),
    // babel({
    //   babelHelpers: "bundled"
    // })
  ]
};