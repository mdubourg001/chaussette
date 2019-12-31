'use strict';

const net = require('net');
const WebSocket = require('ws');
const Chaussette = require('../chaussette');
const { sleep } = require('./test-utils');

const CHAUSSETTE_LISTEN_PORT = 9898;
const TCP_SERVER_LISTEN_PORT = 9999;
const JEST_TIMEOUT = 2000;

describe('Testing Chaussette', () => {
  let wsclient = null;
  let chaussette = null;
  let tcpserver = null;

  let tcpServerSockets = [];

  beforeAll(done => {
    /* --------------------------------------------------
      * WS Client <--> 9898:Chaussette <--> 9999:TCP Server
      -------------------------------------------------- */

    // starting TCP Server and keeping sockets refs
    tcpserver = net.createServer();
    tcpserver.listen(TCP_SERVER_LISTEN_PORT);
    tcpserver.on('connection', socket => {
      tcpServerSockets.push(socket);
      done();
    });

    // Starting Chaussette
    chaussette = new Chaussette({
      listenPort: CHAUSSETTE_LISTEN_PORT,
      targetAddr: 'localhost',
      targetPort: TCP_SERVER_LISTEN_PORT,
      verbosity: 2,
    });
    chaussette.start();

    // Connecting WS Client
    wsclient = new WebSocket(`ws://localhost:${CHAUSSETTE_LISTEN_PORT}`);

    // stopping servers after tests ran
    // TODO: move it to an afterAll
    setTimeout(() => {
      wsclient.close();
      server.close();
      chaussette.stop();
    }, JEST_TIMEOUT);
  });

  test('chaussette must have a well configured socketPair', () => {
    expect(chaussette.socketPairs.length).toEqual(1);

    const pair = chaussette.socketPairs[0];
    expect(pair.preventNextWSMessageForward).toBe(false);
    expect(pair.preventNextTCPMessageForward).toBe(false);
  });

  test('message should be forwarded through chaussette', async () => {
    const wsClientLogs = {
      sent: [
        JSON.stringify('A r4ndom Str1nĝ ~~ \'"'),
        JSON.stringify(42),
        JSON.stringify(0.999),
        JSON.stringify({ foo: 'bar', bar: 0.42 }),
      ],
      received: [],
    };
    const tcpServerLogs = {
      sent: [
        JSON.stringify('Anoth3r random ŝtr1nĝ \\ \'"'),
        JSON.stringify(24),
        JSON.stringify(0.111),
        JSON.stringify({ bar: 'foo', foo: 0.24 }),
      ],
      received: [],
    };

    // storing messages received by WS client
    wsclient.on('message', message => {
      wsClientLogs.received.push(message);
    });

    // storing messages received by TCP server
    tcpServerSockets[0].on('data', data => {
      tcpServerLogs.received.push(data.toString());
    });

    // sending stuff between both ends
    for (let msg of wsClientLogs.sent) {
      wsclient.send(msg);
      await sleep(50);
    }
    for (let msg of tcpServerLogs.sent) {
      tcpServerSockets[0].write(msg);
      await sleep(50);
    }

    // letting chaussette forward everything well
    await sleep(50);

    // checking that everything has been forwarded well
    for (let msg of wsClientLogs.sent) {
      expect(tcpServerLogs.received.includes(msg)).toBeTruthy();
    }
    for (let msg of tcpServerLogs.sent) {
      expect(wsClientLogs.received.includes(msg)).toBeTruthy();
    }
  });

  test('message forwarding should be cancelable through onmessage hooks', async () => {
    const wsClientLogs = {
      sent: [
        JSON.stringify('Not blocked 1'),
        JSON.stringify('Blocked'),
        JSON.stringify('Not blocked 2'),
      ],
      received: [],
    };
    const tcpServerLogs = {
      sent: [
        JSON.stringify('Not blocked 1'),
        JSON.stringify('Blocked'),
        JSON.stringify('Not blocked 2'),
      ],
      received: [],
    };

    // preventing forwarding some messages from both ends
    chaussette.onwsmessage = (message, pairId) => {
      if (message === 'Blocked') chaussette.preventNextWSMessageForward(pairId);
    };
    chaussette.ontcpmessage = (message, pairId) => {
      if (message === 'Blocked')
        chaussette.preventNextTCPMessageForward(pairId);
    };

    // storing messages received by WS client
    wsclient.on('message', message => {
      wsClientLogs.received.push(message);
    });

    // storing messages received by TCP server
    tcpServerSockets[0].on('data', data => {
      tcpServerLogs.received.push(data.toString());
    });

    // sending stuff between both ends
    for (let msg of wsClientLogs.sent) {
      wsclient.send(msg);
      await sleep(50);
    }
    for (let msg of tcpServerLogs.sent) {
      tcpServerSockets[0].write(msg);
      await sleep(50);
    }

    // letting chaussette forward everything well
    await sleep(50);

    // checking that everything has been forwarded well
    for (let msg of wsClientLogs.sent) {
      expect(tcpServerLogs.received.includes(msg)).toBe(msg !== 'Blocked');
    }
    for (let msg of tcpServerLogs.sent) {
      expect(wsClientLogs.received.includes(msg)).toBe(msg !== 'Blocked');
    }
  });
});
