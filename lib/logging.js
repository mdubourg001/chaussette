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

const error = msg => {
  console.error(`${_getnow()} ${chalk.red('ERROR:')} ${msg}`);
};

module.exports = {
  debug,
  log,
  error,
};
