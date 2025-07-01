const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🛠️ CONFIGURACIÓN MIDDLEWARES
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 📋 INFORMACIÓN DEL SERVIDOR
console.log('🚀 Iniciando servidor de Videoclases con IA...');
console.log(`📊 Puerto: ${PORT}`);
console.log(`🔑 Google IA: ${process.env.GOOGLE_AI_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`🗄️ Supabase: ${process.env.SUPABASE_URL ? '✅ Configurado' : '❌ No configurado'}`);

// 📍 RUTA DE SALUD MEJORADA
app.get('/health', (req, res) => {
  res.json({ 
    mensaje: '🚀 API de Videoclases con IA funcionando correctamente',
    fecha: new Date().toLocaleString('es-ES'),
    version: '1.0.0',
    estado: '✅ Operativo',
    servicios: {
      ia: process.env.GOOGLE_AI_API_KEY ? '✅ Google IA Conectada' : '❌ Google IA No configurada',
      database: process.env.SUPABASE_URL ? '✅ Supabase Conectado' : '❌ Supabase No configurado'
    }
  });
});

// 📍 RUTA DE INFORMACIÓN
app.get('/', (req, res) => {
  res.json({
    mensaje: '🎓 Plataforma de Videoclases con IA',
    descripcion: 'API para clases online con inteligencia artificial',
    endpoints: [
      'GET /health - Estado del servidor',
      'POST /api/crear-clase - Crear nueva clase',
      'GET /api/clase/:roomId - Info de una clase',
      'POST /api/iniciar-clase/:roomId - Iniciar clase',
      'POST /api/finalizar-clase - Finalizar y procesar con IA',
      'GET /api/clases/:profesorId - Historial de clases',
      'GET /api/resumen/:sessionId - Resumen de clase procesada'
    ]
  });
});

// 📍 CONECTAR RUTAS DE API
try {
  const apiRoutes = require('./src/routes/api');
  app.use('/api', apiRoutes);
  console.log('✅ Rutas de API conectadas correctamente');
} catch (error) {
  console.error('❌ Error conectando rutas de API:', error.message);
  console.log('⚠️  Servidor funcionará sin rutas de API');
}

// 📍 MANEJO DE ERRORES 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: '🔍 Endpoint no encontrado',
    mensaje: 'Revisa la URL y los endpoints disponibles',
    endpointsDisponibles: [
      'GET /health',
      'GET /',
      'POST /api/crear-clase',
      'GET /api/clase/:roomId',
      'POST /api/iniciar-clase/:roomId',
      'POST /api/finalizar-clase',
      'GET /api/clases/:profesorId',
      'GET /api/resumen/:sessionId'
    ]
  });
});

// 🛡️ MANEJO DE ERRORES NO CAPTURADOS
process.on('uncaughtException', (err) => {
  console.error('💥 Error no capturado:', err);
  console.error('Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promesa rechazada no manejada:', reason);
  console.error('En promesa:', promise);
});

// 🛡️ MANEJO DE SEÑALES DEL SISTEMA
process.on('SIGTERM', () => {
  console.log('📴 Recibida señal SIGTERM. Cerrando servidor gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Recibida señal SIGINT. Cerrando servidor gracefully...');
  process.exit(0);
});

// 🚀 INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`\n🎉 ¡Servidor iniciado exitosamente!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Salud: http://localhost:${PORT}/health`);
  console.log(`🎯 API: http://localhost:${PORT}/api/`);
  console.log(`\n📱 Listo para recibir peticiones...\n`);
});