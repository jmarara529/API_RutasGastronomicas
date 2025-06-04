const pool = require('../db');

// Agrega un lugar a favoritos del usuario
const agregarFavorito = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { place_id, nombre, direccion, categoria, ciudad } = req.body;

    // Verifica si el lugar ya existe en la base de datos
    let [rows] = await pool.query('SELECT id FROM lugares WHERE place_id = ?', [place_id]);
    let id_lugar;
    if (rows.length === 0) {
      // Si no existe, lo inserta
      const result = await pool.query(
        'INSERT INTO lugares (place_id, nombre, direccion, categoria, ciudad) VALUES (?, ?, ?, ?, ?)',
        [place_id, nombre, direccion, categoria, ciudad]
      );
      id_lugar = result[0].insertId;
    } else {
      // Si existe, obtiene su id
      id_lugar = rows[0].id;
    }

    // Inserta el favorito (ignora si ya existe)
    await pool.query('INSERT IGNORE INTO favoritos (id_usuario, id_lugar) VALUES (?, ?)', [id_usuario, id_lugar]);
    // Registrar en historial de acciones
    await pool.query(
      "INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)",
      ['favorito', id_lugar, id_usuario, 'añadir']
    );
    res.json({ msg: 'Favorito agregado' });
  } catch (error) {
    // Maneja errores y responde con mensaje de error
    res.status(500).json({ error: error.message });
  }
};

// Elimina un lugar de los favoritos del usuario
const eliminarFavorito = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { id_lugar } = req.params;

    // Elimina el favorito de la base de datos
    await pool.query('DELETE FROM favoritos WHERE id_usuario = ? AND id_lugar = ?', [id_usuario, id_lugar]);
    // Registrar en historial de acciones
    await pool.query(
      "INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)",
      ['favorito', id_lugar, id_usuario, 'eliminar']
    );
    res.json({ msg: 'Favorito eliminado' });
  } catch (error) {
    // Maneja errores y responde con mensaje de error
    res.status(500).json({ error: error.message });
  }
};

// Lista los lugares favoritos del usuario autenticado o de otro usuario si es admin
const listarFavoritos = async (req, res) => {
  try {
    let id_usuario = req.user.id;
    // Permitir a admin consultar favoritos de cualquier usuario
    if (req.user.es_admin && req.query.admin_id) {
      id_usuario = req.query.admin_id;
    }
    const [favoritos] = await pool.query(
      `SELECT l.* FROM favoritos f
       JOIN lugares l ON f.id_lugar = l.id
       WHERE f.id_usuario = ?`,
      [id_usuario]
    );
    res.json(favoritos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  agregarFavorito,
  eliminarFavorito,
  listarFavoritos,
};
