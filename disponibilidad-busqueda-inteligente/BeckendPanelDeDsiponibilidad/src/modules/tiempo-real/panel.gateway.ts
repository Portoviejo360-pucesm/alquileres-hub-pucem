import { io } from "../../server";

export const emitirActualizacion = (data: any) => {
  io.emit("actualizarDisponibilidad", data);
};
