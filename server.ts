const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const clients = new Map(); // Map<sessionId, socket>

Bun.listen({
  hostname: "localhost",
  port: 8080,
  socket: {
    data(socket, message) {
      const decodedMessage = message.toString();
      if (decodedMessage === 'CloseMASTER') {
        console.log("Received CloseMASTER command from a client. Shutting down server...");
        // Clean up and shut down
        for (let clientSocket of clients.values()) {
          clientSocket.write('Server is shutting down...');
          clientSocket.end();
        }
        process.exit();
      } else {
        // Broadcast the message to all connected clients
        for (let clientSocket of clients.values()) {
          clientSocket.write(`${socket.data.sessionId}: ${decodedMessage}`);
        }
      }
    },
    open(socket) {
      const sessionId = Date.now().toString(36); // A simple unique ID
      socket.data = { sessionId };
      clients.set(sessionId, socket);
      socket.write(`You're connected with session ID: ${sessionId}`);
    },
    close(socket) {
      clients.delete(socket.data.sessionId);
    },
    error(socket, error) {
      console.error(`Error on socket: ${error}`);
    }
  },
});

// Server-side terminal input
rl.on('line', (line) => {
  if (line === 'Close') {
    console.log("Shutting down server...");
    for (let clientSocket of clients.values()) {
      clientSocket.write('Server is shutting down...');
      clientSocket.end();
    }
    process.exit();
  } else {
    for (let clientSocket of clients.values()) {
      clientSocket.write(`[Server Broadcast]: ${line}`);
    }
  }
});
