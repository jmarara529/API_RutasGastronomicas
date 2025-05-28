require('dotenv').config(); // Carga las variables de entorno desde .env
const express = require('express');
const fs = require('fs');
const https = require('https');
const http = require('http');
const cors = require('cors'); // <-- Importa cors

const app = express();
app.use(express.json()); // Permite recibir JSON en las peticiones

// Permitir todas las conexiones externas (CORS abierto)
app.use(cors()); // <-- Permite cualquier origen

// Cargar rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/favoritos', require('./routes/favoritos'));
app.use('/api/historial', require('./routes/historial'));
app.use('/api/lugares', require('./routes/lugares'));
app.use('/api/resenas', require('./routes/resenas'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/visitados', require('./routes/visitados'));
app.use('/api/places', require('./routes/places'));

const PORT_HTTP = process.env.PORT_HTTP || 3000;
const PORT_HTTPS = process.env.PORT_HTTPS || 3443;

// Intentar cargar certificados SSL para HTTPS
let options = {};
let sslOk = false;

try {
    options = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),   // Ruta de la clave privada SSL
        cert: fs.readFileSync(process.env.SSL_CERT_PATH)  // Ruta del certificado SSL
    };
    sslOk = true;
} catch (error) {
    // Si no se encuentran los certificados, solo se iniciará HTTP
    console.warn('⚠️ No se encontraron certificados SSL, solo se iniciará HTTP.');
}

// Inicia siempre HTTP
http.createServer(app).listen(PORT_HTTP, () => {
    console.log(`🔓 Servidor HTTP corriendo en puerto ${PORT_HTTP}`);
});

// Si hay certificados, inicia también HTTPS
if (sslOk) {
    https.createServer(options, app).listen(PORT_HTTPS, () => {
        console.log(`🔐 Servidor HTTPS corriendo en puerto ${PORT_HTTPS}`);
    });
}