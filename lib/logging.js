'use strict';

const dayjs = require('dayjs');
const chalk = require('chalk');

const _getnow = format => dayjs().format(format ? format : 'DD-MM-YY HH:mm:ss');

const debug = options => {
  return msg => {
    console.debug(`${_getnow(options.format)} ${chalk.cyan('DEBUG:')} ${msg}`);
  };
};

const log = options => {
  return msg => {
    console.info(`${_getnow(options.format)} ${chalk.blue('LOG:')} ${msg}`);
  };
};

const error = options => {
  return msg => {
    console.error(`${_getnow(options.format)} ${chalk.red('ERROR:')} ${msg}`);
  };
};

/**
 * @param {string} options.format
 * @return {Object}
 * */
module.exports = options => ({
  debug: debug(options),
  log: log(options),
  error: error(options),
});
