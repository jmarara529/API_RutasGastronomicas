const pool = require('../db');

const marcarVisitado = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { place_id, nombre, direccion, categoria, ciudad } = req.body;

    // Insertar lugar si no existe
    let [rows] = await pool.query('SELECT id FROM lugares WHERE place_id = ?', [place_id]);
    let id_lugar;
    if (rows.length === 0) {
      const result = await pool.query(
        'INSERT INTO lugares (place_id, nombre, direccion, categoria, ciudad) VALUES (?, ?, ?, ?, ?)',
        [place_id, nombre, direccion, categoria, ciudad]
      );
      id_lugar = result[0].insertId;
    } else {
      id_lugar = rows[0].id;
    }

    // Insertar visitado
    await pool.query('INSERT IGNORE INTO visitados (id_usuario, id_lugar) VALUES (?, ?)', [id_usuario, id_lugar]);

    res.json({ msg: 'Lugar marcado como visitado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listarVisitadosUsuario = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const [visitados] = await pool.query(
      `SELECT l.*, v.fecha_visita FROM visitados v JOIN lugares l ON v.id_lugar = l.id WHERE v.id_usuario = ? ORDER BY v.fecha_visita DESC`,
      [id_usuario]
    );
    res.json(visitados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminarVisitado = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { id_lugar } = req.params;

    await pool.query('DELETE FROM visitados WHERE id_usuario = ? AND id_lugar = ?', [id_usuario, id_lugar]);
    res.json({ msg: 'Lugar visitado eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Solo administradores pueden listar todos visitados con filtros
const listarVisitadosAdmin = async (req, res) => {
  try {
    if (!req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

    const { id_usuario, id_lugar } = req.query;
    let query = `SELECT v.*, u.nombre AS nombre_usuario, l.nombre AS nombre_lugar 
                 FROM visitados v
                 JOIN usuarios u ON v.id_usuario = u.id
                 JOIN lugares l ON v.id_lugar = l.id
                 WHERE 1=1`;
    const params = [];

    if (id_usuario) {
      query += ` AND v.id_usuario = ?`;
      params.push(id_usuario);
    }
    if (id_lugar) {
      query += ` AND v.id_lugar = ?`;
      params.push(id_lugar);
    }

    query += ` ORDER BY v.fecha_visita DESC`;

    const [visitados] = await pool.query(query, params);
    res.json(visitados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  marcarVisitado,
  listarVisitadosUsuario,
  eliminarVisitado,
  listarVisitadosAdmin,
};
