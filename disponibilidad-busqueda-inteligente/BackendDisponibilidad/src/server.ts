import app from './app';
import getPort from 'get-port';

async function startServer() {
  // obtiene cualquier puerto libre del sistema
  const port = await getPort();

  app.listen(port, () => {
    console.log(`🚀 Backend ejecutándose en puerto ${port}`);
  });
}

startServer();
