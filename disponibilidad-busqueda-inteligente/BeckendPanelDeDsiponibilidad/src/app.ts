import express from "express";
import cors from "cors";

import { propiedadesRouter } from "./modules/propiedades/propiedades.routes";
import filtrosRouter from "./modules/filtros/filtros.routes";

const app = express();

app.use(cors());
app.use(express.json());

// rutas
app.use("/propiedades", propiedadesRouter);
app.use("/filtros", filtrosRouter);

// test
app.get("/test", (req, res) => res.json({ ok: true }));

export default app;
