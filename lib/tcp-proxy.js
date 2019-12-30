'use strict';

const net = require('net');
const WebSocket = require('ws');

const { log, debug } = require('./logging');

const TCP_SERVER_ENCODING = 'utf8';

const WS_EVENTS_NAMES = {
  LISTEN: 'WS server listening',
  CONNECTION: 'WS client connected',
  MESSAGE: 'WS message received',
  FORWARD: 'WS was sent forwarded message',
  CLOSE: 'WS client closed connection',
  STOP: 'WS server stopped',
};

const TCP_EVENTS_NAMES = {
  CONNECTION: 'TCP connected to TCP server',
  DATA: 'TCP message received',
  FORWARD: 'TCP server was sent forwarded message',
  END: 'TCP server ended connection',
};

class TCPProxy {
  /**
   * @param {{ listenPort: number, targetAddr: string, targetPort: number, verbosity: boolean }} options
   * */
  constructor(options) {
    this.listenPort = options.listenPort;
    this.targetAddr = options.targetAddr;
    this.targetPort = options.targetPort;

    this._server = null;
    this._socketPairs = [];

    /**
     * 0 - no logs
     * 1 - default and warning logs
     * 2 - default, warning and debug logs
     * */
    this.verbosity = options.verbosity || 0;
  }

  // ========== BUSINESS ========== //

  /**
   * @param {module:net.Socket} netsocket
   * @param {WebSocket} websocket
   * @return {WebSocket}
   * */
  _initWebSocket(websocket, netsocket) {
    websocket.on('message', data => {
      if (this.verbosity > 0) log(`${WS_EVENTS_NAMES.MESSAGE}: ${data}`);
      netsocket.write(data);
      if (this.verbosity > 1) debug(`${TCP_EVENTS_NAMES.FORWARD}: ${data}`);
    });

    websocket.on('close', () => {
      if (this.verbosity > 0) log(WS_EVENTS_NAMES.CLOSE);
      netsocket.end();
    });

    return websocket;
  }

  /**
   * @param {module:net.Socket} netsocket
   * @param {WebSocket} websocket
   * @return {module:net.Socket}
   * */
  _initNetSocket(websocket, netsocket) {
    netsocket.setEncoding(TCP_SERVER_ENCODING);

    netsocket.on('data', data => {
      if (this.verbosity > 0) log(`${TCP_EVENTS_NAMES.DATA}: ${data}`);
      websocket.send(data);
      if (this.verbosity > 1) debug(`${WS_EVENTS_NAMES.FORWARD}: ${data}`);
    });

    netsocket.on('end', () => {
      if (this.verbosity > 0) log(TCP_EVENTS_NAMES.END);
      websocket.close();
    });

    return netsocket;
  }

  /**
   * @param {WebSocket} websocket
   * @param {module:net.Socket} netsocket
   * */
  _addSocketPair(websocket, netsocket) {
    this._socketPairs.push([websocket, netsocket]);
  }

  // ========== PUBLIC ========== //

  start() {
    this._server = new WebSocket.Server({ port: this.listenPort });
    if (this.verbosity > 0) log(WS_EVENTS_NAMES.LISTEN);

    this._server.on('connection', ws => {
      if (this.verbosity > 0) log(WS_EVENTS_NAMES.CONNECTION);

      let netsocket = new net.Socket();
      netsocket.connect({ host: this.targetAddr, port: this.targetPort });

      const websocket = this._initWebSocket(ws, netsocket);
      netsocket = this._initNetSocket(ws, netsocket);

      this._addSocketPair(websocket, netsocket);
    });
  }

  stop() {
    this._server.close();
    if (this.verbosity > 0) log(WS_EVENTS_NAMES.STOP);
  }
}

module.exports = TCPProxy;
