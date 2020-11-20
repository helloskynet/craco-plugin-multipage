import resolve from "rollup-plugin-node-resolve";
import pluginJson from "@rollup/plugin-json";

export default {
  input: "./src/index.js",
  output: {
    file: "./bin/index.js",
    format: "cjs",
  },
  plugins: [resolve(), pluginJson()],
  external: [
    "@craco/craco",
    "lodash",
    "commander",
    "fs",
    "path",
    "path-to-regexp",
    "ajv",
    "ajv-keywords",
  ],
};
