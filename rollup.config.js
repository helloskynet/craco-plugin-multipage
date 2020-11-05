import resolve from "rollup-plugin-node-resolve";

export default {
  input: "./src/index.js",
  output: {
    file: "./bin/index.js",
    format: "cjs",
  },
  plugins: [resolve()],
  external: [
    "@craco/craco",
    "lodash",
    "commander",
    "fs",
    "path",
    "path-to-regexp",
  ],
};
