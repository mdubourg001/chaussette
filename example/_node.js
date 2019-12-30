'use strict';

const net = require('net');

const delaysend = (socket, data) => {
  setTimeout(() => {
    socket.write(data.toString());
  }, 3000);
};

// ========== //

const server = new net.createServer();

server.on('connection', socket => {
  console.log('New connection.');

  socket.on('data', message => {
    const data = message.toString();
    console.log('Received: ', data);

    delaysend(socket, parseInt(data) * 2);
  });
});

server.listen(10001);
