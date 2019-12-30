'use strict';

const net = require('net');
const WebSocket = require('ws');

const { log, debug, error } = require('./logging');

const TCP_SERVER_ENCODING = 'utf8';

const GENERAL_EVENTS_NAMES = {
  ADD_PAIR: 'Socket pair added',
  REMOVE_PAIR: 'Socket pair removed',
};

const WS_EVENTS_NAMES = {
  LISTEN: 'WS - server listening',
  CONNECTION: 'WS - client connected',
  MESSAGE: 'WS - message received',
  FORWARD: 'WS - was sent forwarded message',
  CLOSE: 'WS - client closed connection',
  STOP: 'WS - server stopped',
  ERROR: 'WS - error',
};

const TCP_EVENTS_NAMES = {
  CONNECTION: 'TCP - connected to TCP server',
  DATA: 'TCP - message received',
  FORWARD: 'TCP - server was sent forwarded message',
  END: 'TCP - server ended connection',
  ERROR: 'TCP - error',
};

class TCPProxy {
  /**
   * @param {number} options.listenPort
   * @param {string} options.targetAddr
   * @param {number} options.targetPort
   * @param {boolean} options.verbosity
   * */
  constructor(options) {
    this.listenPort = options.listenPort;
    this.targetAddr = options.targetAddr;
    this.targetPort = options.targetPort;

    this._server = null;
    this.socketPairs = [];
    this.pairId = 0;

    /**
     * 0 - only error logs
     * 1 - previous + default and warning logs
     * 2 - previous + debug logs
     * */
    this.verbosity = options.verbosity || 0;
  }

  // ========== BUSINESS ========== //

  /**
   * @param {number} pairId
   * @param {module:net.Socket} netsocket
   * @param {WebSocket} websocket
   * @return {WebSocket}
   * */
  _initWebSocket(pairId, websocket, netsocket) {
    websocket.on('message', data => {
      if (this.verbosity > 0) log(`${WS_EVENTS_NAMES.MESSAGE}: ${data}`);
      netsocket.write(data);
      if (this.verbosity > 1) debug(`${TCP_EVENTS_NAMES.FORWARD}: ${data}`);
    });

    websocket.on('close', () => {
      if (this.verbosity > 0) log(WS_EVENTS_NAMES.CLOSE);
      netsocket.end();

      this._removeSocketPair(pairId);
    });

    websocket.on('error', err => {
      error(`${WS_EVENTS_NAMES.ERROR}: ${err}`);
      netsocket.end();
    });

    return websocket;
  }

  /**
   * @param {number} pairId
   * @param {module:net.Socket} netsocket
   * @param {WebSocket} websocket
   * @return {module:net.Socket}
   * */
  _initNetSocket(pairId, websocket, netsocket) {
    netsocket.setEncoding(TCP_SERVER_ENCODING);

    netsocket.on('data', data => {
      if (this.verbosity > 0) log(`${TCP_EVENTS_NAMES.DATA}: ${data}`);
      websocket.send(data);
      if (this.verbosity > 2) debug(`${WS_EVENTS_NAMES.FORWARD}: ${data}`);
    });

    netsocket.on('end', () => {
      if (this.verbosity > 0) log(TCP_EVENTS_NAMES.END);
      websocket.close();

      this._removeSocketPair(pairId);
    });

    netsocket.on('error', err => {
      error(`${TCP_EVENTS_NAMES.ERROR}: ${err}`);
      websocket.close();
    });

    return netsocket;
  }

  /**
   * @param {number} pairId
   * @param {WebSocket} websocket
   * @param {module:net.Socket} netsocket
   * */
  _addSocketPair(pairId, websocket, netsocket) {
    this.socketPairs.push({
      id: pairId,
      websocket,
      netsocket,
    });
    if (this.verbosity > 1)
      debug(`${GENERAL_EVENTS_NAMES.ADD_PAIR}: #${pairId}`);
  }

  /**
   * @param {number} pairId
   * */
  _removeSocketPair(pairId) {
    this.socketPairs = this.socketPairs.filter(p => p.id !== pairId);
    if (this.verbosity > 1)
      debug(`${GENERAL_EVENTS_NAMES.REMOVE_PAIR}: #${pairId}`);
  }

  // ========== PUBLIC ========== //

  /**
   * Starts the WS server to listen for connections
   * */
  start() {
    this._server = new WebSocket.Server({ port: this.listenPort });
    if (this.verbosity > 0) log(WS_EVENTS_NAMES.LISTEN);

    this._server.on('connection', ws => {
      const pairId = ++this.pairId;
      if (this.verbosity > 0) log(WS_EVENTS_NAMES.CONNECTION);

      let netsocket = new net.Socket();
      netsocket.connect({ host: this.targetAddr, port: this.targetPort });

      const websocket = this._initWebSocket(pairId, ws, netsocket);
      netsocket = this._initNetSocket(pairId, ws, netsocket);

      this._addSocketPair(pairId, websocket, netsocket);
    });
  }

  /**
   * Stops the WS server
   * */
  stop() {
    this._server.close();
    if (this.verbosity > 0) log(WS_EVENTS_NAMES.STOP);
  }
}

module.exports = TCPProxy;
