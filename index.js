const cli = require('commander');
const TCPProxy = require('./lib/tcp-proxy');

cli
  .option('-l --listenport [listenport]', 'port to listen on')
  .option('-t --target [target]', 'target domain or IP to forward data')
  .option('-p --targetport [targetport]', 'target port to forward data')
  .option('-v --verbosity [verbosity]', 'verbosity level (0, 1, 2)')
  .parse(process.argv);

new TCPProxy({
  listenPort: cli.listenport,
  targetAddr: cli.target,
  targetPort: cli.targetport,
  verbosity: cli.verbosity || 0,
}).start();
