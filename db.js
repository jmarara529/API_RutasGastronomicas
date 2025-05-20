const mysql = require('mysql2/promise');
require('dotenv').config();

// Crea un pool de conexiones a MySQL usando variables de entorno
const db = mysql.createPool({
    host: process.env.DB_HOST,       // Dirección del servidor MySQL
    user: process.env.DB_USER,       // Usuario de la base de datos
    password: process.env.DB_PASSWORD, // Contraseña del usuario
    database: process.env.DB_NAME    // Nombre de la base de datos
});

// Exporta el pool para usarlo en otros archivos
module.exports = db;