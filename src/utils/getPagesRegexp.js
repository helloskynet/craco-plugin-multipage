const { pathToRegexp } = require("path-to-regexp");

const pages = [];

/**
 * 生成用于匹配指定页面和忽略页面的Regexp
 * @param {Object} pluginOptions
 */
function getPagesRegexp(pluginOptions) {
  const pages = [];
  const ignore = [];

  if (pluginOptions.pages) {
    pluginOptions.pages.split(",").forEach((item) => {
      pages.push(...getPathRegexp(item));
    });
  }

  if (pluginOptions.ignore) {
    pluginOptions.ignore.split(",").forEach((item) => {
      if (item) {
        ignore.push(pathToRegexp(item));
      }
    });
  }

  return { pages, ignore };
}

/**
 * 指定页面的时候 其上级文件夹页面也需要存在
 * @param {string} path
 */
function getPathRegexp(path) {
  const regexpList = [];
  if (path) {
    let basePath = "";
    path.split("/").forEach((item) => {
      let localPath = item;
      if (basePath) {
        localPath = `${basePath}/${item}`;
      }
      if (!pages.includes(localPath)) {
        regexpList.push(pathToRegexp(localPath));
        pages.push(localPath);
      }
      basePath = localPath;
    });
  }
  return regexpList;
}

module.exports = getPagesRegexp;
