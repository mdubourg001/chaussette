'use strict';

/**
 * Interrupt execution for `ms` amount of time
 * @param {number} ms
 * @return {Promise}
 * */
const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = {
  sleep,
};
