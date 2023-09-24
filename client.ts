import * as crypto from 'crypto';
import * as fs from 'fs';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let currentSocket;

function sendFileToServer(filePath: string) {
    if (!currentSocket || typeof currentSocket.write !== 'function') {
        console.error('Invalid socket object or socket not connected.');
        return;
    }

    const fileStream = fs.createReadStream(filePath);
    fileStream.on('data', (chunk) => {
        currentSocket.write(`FILE_CHUNK:${chunk}`);
    });

    fileStream.on('end', () => {
        currentSocket.write('FILE_END');
    });
}

const BunSocket = Bun.connect({
    hostname: "localhost",
    port: 8080,
    socket: {
        data(socket, message) {
            const decodedMessage = message.toString();
            const date = new Date();
            if (decodedMessage.startsWith('Nome:')) {
                const lines = decodedMessage.split('\n');
                const fileName = lines[0].split(': ')[1].trim();
                const fileSize = parseInt(lines[1].split(': ')[1]);
                const fileHash = lines[2].split(': ')[1].trim();
                const fileData = lines[3].split(': ')[1];
                const receivedHash = crypto.createHash('sha256').update(fileData).digest('hex');
                if (receivedHash !== fileHash) {
                    console.error('File hash mismatch!');
                    return;
                }
                const newPath = `${date.toISOString()}_${fileName}`;
                fs.writeFileSync(newPath, Buffer.from(fileData, 'hex'));
                console.log(`Received and saved file: ${newPath}`);                
                
            } else if (decodedMessage === 'Disconnecting as per request.') {
                console.log("Server requested to disconnect.");
                socket.end();
                rl.close();
            } else {
                console.log(`[Server]: ${decodedMessage}`);
            }
        },
        open(socket) {
            currentSocket = socket;
            const sessionId = Date.now().toString(36);
            console.log("Connected to chat server!");

            rl.on('line', (line) => {
                if (line.startsWith('sendfile:')) {
                    const filePath = line.split(':')[1];
                    sendFileToServer(filePath);
                } else if (line.toLowerCase() === "exit") {
                    console.log("Disconnecting from server...");
                    socket.write("Sair");
                } else {
                    socket.write(line);
                    console.log(`${sessionId}[Me]: ${line}`);
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