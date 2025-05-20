const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');  // Middleware de autenticación
const isAdmin = require('../middleware/isAdmin');      // Middleware para verificar admin

// Ruta para obtener el historial de eliminaciones (solo admin)
router.get('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        // Consulta el historial y une con el nombre del usuario que ejecutó la eliminación
        const [historial] = await pool.query(`
            SELECT h.*, u.nombre AS ejecutado_por 
            FROM historial_eliminaciones h 
            LEFT JOIN usuarios u ON h.id_usuario = u.id 
            ORDER BY h.fecha_eliminacion DESC
        `);
        res.json(historial);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener el historial', error: error.message });
    }
});

module.exports = router;