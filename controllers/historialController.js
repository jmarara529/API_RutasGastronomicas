const pool = require('../db');

// Obtener el historial de eliminaciones (solo admin)
const obtenerHistorial = async (req, res) => {
    try {
        // Verifica si el usuario autenticado es administrador
        if (!req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

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
};

module.exports = {
    obtenerHistorial
};
