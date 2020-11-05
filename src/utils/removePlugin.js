/**
 * 移除原有的 HTMLWebpackPlugin和 ManifestPlugin
 * @param {object} webpackConfig
 */
function removePlugin(webpackConfig) {
  const HtmlWebpackPlugin = {
    plugin: {},
    config: {},
  };
  const ManifestPlugin = {
    plugin: {},
    config: {},
  };
  webpackConfig.plugins = webpackConfig.plugins.filter((item) => {
    if (item.constructor.name === "HtmlWebpackPlugin") {
      HtmlWebpackPlugin.plugin = item.constructor;
      HtmlWebpackPlugin.config = item.options;
      return false;
    }
    if (item.constructor.name === "ManifestPlugin") {
      ManifestPlugin.plugin = item.constructor;
      ManifestPlugin.config = item.opts;
      return false;
    }

    return true;
  });
  return { HtmlWebpackPlugin, ManifestPlugin };
}
export default removePlugin;
