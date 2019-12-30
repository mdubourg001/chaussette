'use strict';

const dayjs = require('dayjs');
const chalk = require('chalk');

const _getnow = () => dayjs().format('DD-MM-YY HH:mm:ss');

const debug = msg => {
  console.debug(`${_getnow()} ${chalk.cyan('DEBUG:')} ${msg}`);
};

const log = msg => {
  console.info(`${_getnow()} ${chalk.blue('LOG:')} ${msg}`);
};

const warn = msg => {
  console.info(`${_getnow()} ${chalk.orange('WARN:')} ${msg}`);
};

module.exports = {
  debug,
  log,
  warn,
};
