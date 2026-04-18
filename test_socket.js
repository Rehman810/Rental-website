import { io } from "socket.io-client";
const socket = io("http://localhost:4001");
socket.on("connect", () => console.log("Connected"));
socket.on("connect_error", (err) => console.log("Error:", err.message));
setTimeout(() => process.exit(0), 3000);
