import express from "express";
import cors from "cors";
import { propiedadesRouter } from "./modules/propiedades/propiedades.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/propiedades", propiedadesRouter);

export default app;
