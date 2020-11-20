const util = require('util');
const { red, cyan, yellow, green } = require('colorette');

export default {
    error: (val) => console.error(`[craco-plugin-multipage] ${red(util.format(val))}`),
    warn: (val) => console.warn(`[craco-plugin-multipage] ${yellow(val)}`),
    info: (val) => console.info(`[craco-plugin-multipage] ${cyan(val)}`),
    success: (val) => console.log(`[craco-plugin-multipage] ${green(val)}`),
    log: (val) => console.log(`[craco-plugin-multipage] ${val}`),
    raw: (val) => console.log(val),
};
