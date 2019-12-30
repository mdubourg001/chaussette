## Chaussette

Chaussette is a NodeJS proxy. It allows you to communicate with a TCP server
(or any protocol built on it) from a browser's WebSocket.

When started on port **9898**, for example, Chaussette will spawn a WebSocket
server and, for every WebSocket client connecting to it, will create an associated
Socket connected to specified host and port, and forward every data to it.

**"Chaussette"** is the literal French translation of the word "Socket".

---

### Usage

Chaussette is usable either from command-line interface, or as a node module:

Either way, you can install from yarn / npm:

```shell script
npm install chaussette
```

If you wish to use it from CLI, you can install it globally:

```shell script
npm install chaussette -g
```

#### CLI usage

```shell script
chaussette -l 9898 -t example.com -p 9999 -v 2
```

Using the previous command line, WebSockets will be able to connect to
localhost on port **9898**. Everything data sent by client over such WebSocket
will be then forwarded to **example.com**, on port **9999**.

Options used here are the following:

- **-l (--listenport)** port to listen on
- **-t (--target)** target to forward data to
- **-p (--targetport)** port to forward data to
- **-v (--verbosity)** verbosity level:
  - 0: error logs only
  - 1: previous + default and warning logs
  - 2: previous + debug logs

#### Node module usage

```javascript
const Chaussette = require('chaussette');

const proxy = new Chaussette({
  listenPort: 9898,
  targetAddr: 'example.com',
  targetPort: 9999,
  verbosity: 1, // optional, default is 0
});

// configures the server and starts listening on port 9898
proxy.start();
```

---

### Left to do

#### Features

- [x] Usage from CLI
- [x] Usage from NodeJS
- [ ] Allow WS to provide the host and port to connect to (with default callback)
- [ ] External messages hooks (ex. 'onmessage' from Chaussette object)

#### Logs

- [x] Verbosity levels
- [x] Colored logs
- [ ] Allow logs options
- [ ] Allow date formatting in logs (dayjs / momentjs ?)
- [ ] Allow logging to files (one for WS, one for TCP ?)
- [ ] Log connected client's informations + on message

#### Others

- [ ] Send proper closing informations to both ends

#### Tests

- [ ] Setup tests
