import * as crypto from 'crypto';
import * as fs from 'fs';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const clients = new Map();

Bun.listen({
    hostname: "localhost",
    port: 8080,
    socket: {
        data(socket, message) {
            const decodedMessage = message.toString();
            const date = new Date();
            console.log(`[Client-${socket.data.sessionId}][${date}]: ${decodedMessage}`);
            if (decodedMessage === 'Sair') {
                socket.write('Disconnecting as per request.');
                socket.end();
                clients.delete(socket.data.sessionId);
                return;
            }
            const sessionId = Date.now().toString(36);
            console.log(`${date}[${sessionId}]: ${decodedMessage}`);
        },
        open(socket) {
            const sessionId = Date.now().toString(36);
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

rl.on('line', (line) => {
    const data = new Date();
    if (line.startsWith('Arquivo')) {
        const fileName = line.split(' ')[1].trim();
        if (fs.existsSync(fileName)) {
            const fileData = fs.readFileSync(fileName);
            const hash = crypto.createHash('sha256').update(fileData).digest('hex');
            for (let clientSocket of clients.values()) {
                clientSocket.write(`Nome: ${fileName}\nTamanho: ${fileData.length} bytes\nHash: ${hash}\nDados: ${fileData}\nStatus: ok`);
            }
            console.log(`[Server][${data}]: Sent file ${fileName} to clients.`);
        } else {
            for (let clientSocket of clients.values()) {
                clientSocket.write(`Status: nok (Arquivo ${fileName} inexistente.)`);
            }
            console.log(`[Server][${data}]: File ${fileName} not found.`);
        }
    } else if (line === 'shut-down') {
        console.log("Shutting down server...");
        for (let clientSocket of clients.values()) {
            clientSocket.write('Server is shutting down...');
            clientSocket.end();
        }
        process.exit();
    } else {
        console.log(`[Server][${data}]: ${line}`);
        for (let clientSocket of clients.values()) {
            clientSocket.write(`[Server Chat]: ${line}`);
        }
    }
});
