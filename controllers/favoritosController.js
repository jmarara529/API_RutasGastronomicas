const pool = require('../db');

const agregarFavorito = async (req, res) => {
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

    // Insertar favorito
    await pool.query('INSERT IGNORE INTO favoritos (id_usuario, id_lugar) VALUES (?, ?)', [id_usuario, id_lugar]);

    res.json({ msg: 'Favorito agregado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listarFavoritos = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const [favoritos] = await pool.query(
      `SELECT l.* FROM favoritos f JOIN lugares l ON f.id_lugar = l.id WHERE f.id_usuario = ?`,
      [id_usuario]
    );
    res.json(favoritos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminarFavorito = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { id_lugar } = req.params;

    await pool.query('DELETE FROM favoritos WHERE id_usuario = ? AND id_lugar = ?', [id_usuario, id_lugar]);
    res.json({ msg: 'Favorito eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  agregarFavorito,
  listarFavoritos,
  eliminarFavorito,
};
