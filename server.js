// Importamos nuestras "herramientas de cocina"
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Creamos nuestro "restaurante" (servidor)
const app = express();
const PORT = 3000;

// Configuramos nuestro restaurante
app.use(cors());
app.use(express.json());

// Una ruta simple para probar que todo funciona
app.get('/health', (req, res) => {
  res.json({ 
    mensaje: '¡Hola! Tu servidor funciona correctamente 🎉',
    fecha: new Date().toLocaleString()
  });
});

// "Abrir el restaurante" (iniciar el servidor)
app.listen(PORT, () => {
  console.log(`🚀 Servidor funcionando en http://localhost:${PORT}`);
  console.log(`Prueba ir a: http://localhost:${PORT}/health`);
});