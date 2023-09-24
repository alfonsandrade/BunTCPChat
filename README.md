# BunTCPChat
BunTCPChat leverages the Bun framework to craft a TypeScript-based communication system. Designed with the modern web in mind, it supports broadcast messaging, multi-client management, and robust file transfer capabilities. Perfect for developers looking to integrate secure and efficient file-sharing into their TypeScript applications.

---

### Instructions for Project Execution

**Instructions**:

1. **Installation of Bun**:
   - Open your terminal or command line.
   - Run the following command to install Bun:
     ```
     curl -fsSL https://bun.sh/install | bash 
     ```

2. **Executing the Server**:
   - Ensure you are in the correct directory containing the `server.ts` file.
   - In the terminal or command line, execute the following:
     ```
     bun server.ts
     ```
   - Upon running, the server should display messages indicating its operation, such as accepting client connections and sending/receiving messages.

3. **Executing the Client**:
   - In a new terminal or command line window, navigate to the directory containing the `client.ts` file.
   - Run the following command:
     ```
     bun client.ts
     ```
   - The client will automatically connect to the server.

4. **Program Functions**:
   - **Server**:
     - Accepts connections from clients and provides a session ID.
     - Sends files to clients.
       ```bash
       File filename
       ```
     - Logs received messages from clients.
     - Can be shut down by typing `shut-down` in the console.
   - **Client**:
     - Receives and displays messages from the server.
     - Can send messages to the server.
     - Checks the integrity of the received file.
     - Received files are saved.
     - Ends the connection with the server by typing:
       ```bash
         Exit
       ```

---