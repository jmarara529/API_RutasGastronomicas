const pool = require('../db');

// Controlador para listar el historial de eliminaciones (solo admin)
const listarHistorial = async (req, res) => {
  try {
    // Verifica si el usuario autenticado es administrador
    if (!req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

    // Consulta el historial de eliminaciones y une con el nombre del usuario que eliminó
    const [historial] = await pool.query(`
      SELECT h.*, u.nombre AS usuario_eliminador
      FROM historial_eliminaciones h
      LEFT JOIN usuarios u ON h.id_usuario = u.id
      ORDER BY h.fecha_eliminacion DESC
    `);

    // Devuelve el historial como respuesta
    res.json(historial);
  } catch (error) {
    // Maneja errores y responde con mensaje de error
    res.status(500).json({ error: error.message });
  }
};

// Exporta la función del controlador
module.exports = {
  listarHistorial,
};
