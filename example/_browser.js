'use strict';

const delaysend = (ws, data) => {
  setTimeout(() => {
    ws.send(data);
  }, 3000);
};

// ========== //

const ws = new WebSocket('ws://127.0.0.1:9999');

ws.onmessage = message => {
  console.log('Received: ', message.data);

  delaysend(ws, parseInt(message.data) * 2);
};

delaysend(ws, '1');
