import http from "http";
import app from "./app";
import { Server } from "socket.io";
import { pool } from "./config/database";

const server = http.createServer(app);

export const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", () => {
  console.log("Cliente conectado al Panel de Disponibilidad");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
