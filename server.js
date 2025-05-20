require('dotenv').config();
const express = require('express');
const fs = require('fs');
const https = require('https');
const http = require('http');

const app = express();
app.use(express.json());

// Cargar rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/favoritos', require('./routes/favoritos'));
app.use('/api/historial', require('./routes/historial'));
app.use('/api/lugares', require('./routes/lugares'));
app.use('/api/resenas', require('./routes/resenas'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/visitados', require('./routes/visitados'));

const PORT_HTTP = process.env.PORT_HTTP || 3000;
const PORT_HTTPS = process.env.PORT_HTTPS || 3443;

// Intentar cargar certificados SSL
let useHttps = false;
let options = {};

try {
    options = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH)
    };
    useHttps = true;
} catch (error) {
    console.warn('⚠️ No se encontraron certificados SSL, iniciando en HTTP.');
}

// Servidor HTTPS si hay certificados, de lo contrario HTTP
if (useHttps) {
    https.createServer(options, app).listen(PORT_HTTPS, () => {
        console.log(`🔐 Servidor HTTPS corriendo en puerto ${PORT_HTTPS}`);
    });
} else {
    http.createServer(app).listen(PORT_HTTP, () => {
        console.log(`🔓 Servidor HTTP corriendo en puerto ${PORT_HTTP}`);
    });
}