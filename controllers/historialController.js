const pool = require('../db');

const listarHistorial = async (req, res) => {
  try {
    if (!req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

    const [historial] = await pool.query(`
      SELECT h.*, u.nombre AS usuario_eliminador
      FROM historial_eliminaciones h
      LEFT JOIN usuarios u ON h.id_usuario = u.id
      ORDER BY h.fecha_eliminacion DESC
    `);

    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listarHistorial,
};
