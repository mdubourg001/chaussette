const TCPProxy = require('./lib/tcp-proxy');

const tcpProxy = new TCPProxy(9999, '127.0.0.1', 10001);
tcpProxy.start();
