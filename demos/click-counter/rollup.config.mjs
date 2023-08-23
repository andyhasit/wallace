import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';


export default {
  input: "src/index.jsx",
  output: {
    file: "dist/index.js",
    format: "iife"
  },
  plugins: [
    commonjs(),
    nodeResolve(),
    babel({
      babelHelpers: "bundled"
    }),
    process.env.NODE_ENV === 'production' && terser(),
  ]
};