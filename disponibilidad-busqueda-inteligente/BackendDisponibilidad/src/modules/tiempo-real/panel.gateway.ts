import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id);
  });
};

// 🔥 EVENTO: cambio de estado
export const emitirCambioEstado = (payload: {
  id_propiedad: number;
  estado_id: number;
  estado: string;
  precio_mensual: number;
  publico_objetivo: string;
  timestamp: Date;
}) => {
  console.log("📡 WS estado:", payload);
  io.emit("propiedad:estado-cambiado", payload);
};

// 🔥 EVENTO: servicios actualizados
export const emitirServiciosActualizados = (payload: {
  id_propiedad: number;
  servicios: any[];
  timestamp: string;
}) => {
  console.log("📡 WS servicios:", payload);
  io.emit("propiedad:servicios", payload);
};
