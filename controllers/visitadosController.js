const pool = require('../db');

// Marca un lugar como visitado por el usuario autenticado
const marcarVisitado = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { place_id, nombre, direccion, categoria, ciudad, id_lugar } = req.body;

    let lugarId = id_lugar;

    // Si no se pasa id_lugar, buscar o crear el lugar por place_id
    if (!lugarId && place_id) {
      let [rows] = await pool.query('SELECT id FROM lugares WHERE place_id = ?', [place_id]);
      if (rows.length === 0) {
        const result = await pool.query(
          'INSERT INTO lugares (place_id, nombre, direccion, categoria, ciudad) VALUES (?, ?, ?, ?, ?)',
          [place_id, nombre, direccion, categoria, ciudad]
        );
        lugarId = result[0].insertId;
      } else {
        lugarId = rows[0].id;
      }
    }

    if (!lugarId) {
      return res.status(400).json({ msg: 'El ID del lugar es obligatorio' });
    }

    await pool.query('INSERT IGNORE INTO visitados (id_usuario, id_lugar) VALUES (?, ?)', [id_usuario, lugarId]);
    res.json({ msg: 'Visita registrada correctamente' });
  } catch (error) {
    res.status(500).json({ msg: 'Error al registrar la visita', error: error.message });
  }
};

// Lista los lugares visitados por el usuario autenticado
const listarVisitadosUsuario = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const [visitados] = await pool.query(
      `SELECT v.*, l.nombre AS nombre_lugar, v.fecha_visita
       FROM visitados v
       JOIN lugares l ON v.id_lugar = l.id
       WHERE v.id_usuario = ?
       ORDER BY v.fecha_visita DESC`,
      [id_usuario]
    );
    res.json(visitados);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener los lugares visitados', error: error.message });
  }
};

// Lista todas las visitas (solo admin, con filtros opcionales)
const listarVisitadosAdmin = async (req, res) => {
  try {
    const { id_usuario, id_lugar } = req.query;
    let query = `
      SELECT v.*, u.nombre AS nombre_usuario, l.nombre AS nombre_lugar 
      FROM visitados v 
      JOIN usuarios u ON v.id_usuario = u.id 
      JOIN lugares l ON v.id_lugar = l.id
      WHERE 1=1
    `;
    const params = [];

    if (id_usuario) {
      query += ' AND v.id_usuario = ?';
      params.push(id_usuario);
    }
    if (id_lugar) {
      query += ' AND v.id_lugar = ?';
      params.push(id_lugar);
    }

    const [visitados] = await pool.query(query + ' ORDER BY v.fecha_visita DESC', params);
    res.json(visitados);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener todas las visitas', error: error.message });
  }
};

// Elimina un lugar de la lista de visitados del usuario autenticado
const eliminarVisitado = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { id_lugar } = req.params;

    const [resultado] = await pool.query('DELETE FROM visitados WHERE id_usuario = ? AND id_lugar = ?', [id_usuario, id_lugar]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ msg: 'Visita no encontrada' });
    }

    // Registrar en historial
    await pool.query(
      'INSERT INTO historial_eliminaciones (tipo_entidad, id_entidad, id_usuario) VALUES (?, ?, ?)',
      ['visitado', id_lugar, id_usuario]
    );

    res.json({ msg: 'Visita eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ msg: 'Error al eliminar la visita', error: error.message });
  }
};

module.exports = {
  marcarVisitado,
  listarVisitadosUsuario,
  listarVisitadosAdmin,
  eliminarVisitado,
};
