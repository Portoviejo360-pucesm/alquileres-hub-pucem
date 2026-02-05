import app from './app';

const PORT = process.env.PORT || 8004;

app.listen(PORT, () => {
  console.log(`🚀 Módulo Disponibilidad ejecutándose en puerto ${PORT}`);
  console.log(`📍 Endpoints disponibles:`);
  console.log(`   GET  /propiedades`);
  console.log(`   GET  /propiedades/:id`);
  console.log(`   POST /propiedades`);
  console.log(`   PUT  /propiedades/:id`);
  console.log(`   PUT  /propiedades/:id/estado`);
  console.log(`   GET  /filtros/propiedades`);
});