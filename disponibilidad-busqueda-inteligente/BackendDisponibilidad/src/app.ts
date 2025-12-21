import express from "express";
import cors from "cors";

import { propiedadesRouter } from "./routers/propiedades.routes";
import { filtrosRouter } from "./routers/filtros.routes"; // 👈 FALTA ESTO
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/propiedades", propiedadesRouter);
app.use("/filtros", filtrosRouter); // 👈 Y ESTO

// Middleware de manejo de errores
app.use(errorHandler);

export default app;