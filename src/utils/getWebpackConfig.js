const { whenDev } = require("@craco/craco");
const { sep } = require("path");
const { isObject, isFunction } = require("lodash");

function getWebpackConfig(
  pages = [],
  HtmlWebpackPlugin = {},
  ManifestPlugin = {},
  pluginOptions
) {
  const plugins = [];
  const entry = {};
  const isDev = whenDev(() => true, false);

  let customConfig = {};

  let isFun = false;
  if (isFunction(pluginOptions.HtmlWebpackPluginOptions)) {
    isFun = true;
  } else if (isObject(pluginOptions.HtmlWebpackPluginOptions)) {
    customConfig = pluginOptions.HtmlWebpackPluginOptions;
  }

  pages.forEach((item) => {
    entry[item.name] = [
      isDev && require.resolve("react-dev-utils/webpackHotDevClient"),
      item.entry,
    ].filter(Boolean);
    let config = Object.assign({}, HtmlWebpackPlugin.config, customConfig, {
      title: item.title,
      chunks: [item.name],
      filename: `${pluginOptions.htmlOutputDir}${sep}${item.dir}.html`,
    });
    if (isFun) {
      config = pluginOptions.HtmlWebpackPluginOptions(config);
      if (!isObject(config)) {
        console.error("HtmlWebpackPluginOptions 应该返回一个 Object");
        process.exit(1);
      }
    }

    plugins.push(new HtmlWebpackPlugin.plugin(config));
  });

  plugins.push(
    new ManifestPlugin.plugin(
      Object.assign({}, ManifestPlugin.config, {
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
          const entrypointFiles = [];
          Object.values(entrypoints).forEach((entrypoint) => {
            entrypointFiles.push(
              ...entrypoint.filter((fileName) => !fileName.endsWith(".map"))
            );
          });

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        },
      })
    )
  );

  return {
    plugins,
    entry,
  };
}

module.exports = getWebpackConfig;
