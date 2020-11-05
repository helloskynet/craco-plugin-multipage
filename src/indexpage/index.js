/**
 * 生成索引页面
 * @param {Object} HtmlWebpackPlugin webpack插件
 * @param {Array} pages 页面列表
 */
function getIndexPage(HtmlWebpackPlugin, pages) {
  return new HtmlWebpackPlugin.plugin(
    Object.assign({}, HtmlWebpackPlugin.config, {
      chunks: [],
      title: "index/索引页面",
      templateContent() {
        let html = "<ul>";
        pages.forEach((item) => {
          if (item.options) {
            html += `<li><a href="${item.options.filename}">${item.options.title}(${item.options.filename})</a></li>`;
          }
        });
        return `${html}</ul>`;
      },
    })
  );
}

export default getIndexPage;
