#!/usr/bin/env node

const cli = require('commander');
const Chaussette = require('./lib/chaussette');

cli
  .requiredOption('-l --listenport [listenport]', 'port to listen on')
  .requiredOption('-t --target [target]', 'target domain or IP to forward data')
  .requiredOption('-p --targetport [targetport]', 'target port to forward data')
  .option('-v --verbosity [verbosity]', 'verbosity level (0, 1, 2)')
  .parse(process.argv);

new Chaussette({
  listenPort: cli.listenport,
  targetAddr: cli.target,
  targetPort: cli.targetport,
  verbosity: cli.verbosity || 0,
}).start();
