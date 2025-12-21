import http from "node:http";
import app from "./app";
import { initSocket } from "./modules/tiempo-real/panel.gateway";

const PORT = process.env.PORT || 3000;

// crear servidor HTTP con app ya configurada
const server = http.createServer(app);

// inicializar websocket
initSocket(server);

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
