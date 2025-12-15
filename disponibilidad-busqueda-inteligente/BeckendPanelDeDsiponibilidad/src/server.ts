import dotenv from "dotenv";
dotenv.config(); // 👈 SIEMPRE ARRIBA

import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
