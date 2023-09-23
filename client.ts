const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const socket = Bun.connect({
  hostname: "localhost",
  port: 8080,
  socket: {
    data(socket, message) {
      const decodedMessage = message.toString(); // Decode buffer to string
      console.log(`[Server Message]: ${decodedMessage}`);
    },
    open(socket) {
      console.log("Connected to chat server!");

      rl.on('line', (line) => {
        if (line === 'disconnect') {
          console.log("Disconnecting from the server...");
          socket.end();
          rl.close();
        } else {
          socket.write(line);
        }
      });
    },
    close(socket) {
      console.log("Disconnected from chat server.");
      rl.close();
    },
    error(socket, error) {
      console.error(`Client error: ${error}`);
    },
    end(socket) {
      console.log("Connection closed by server.");
    }
  },
});
