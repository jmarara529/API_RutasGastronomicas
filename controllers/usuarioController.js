const pool = require('../db');
const bcrypt = require('bcryptjs');

const editarNombre = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (parseInt(id) === 1) return res.status(403).json({ msg: 'No se puede modificar el usuario 1' });
    if (req.user.id !== parseInt(id) && !req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

    await pool.query('UPDATE usuarios SET nombre = ? WHERE id = ?', [nombre, id]);
    res.json({ msg: 'Nombre actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editarCorreo = async (req, res) => {
  try {
    const { id } = req.params;
    const { correo } = req.body;

    if (parseInt(id) === 1) return res.status(403).json({ msg: 'No se puede modificar el usuario 1' });
    if (req.user.id !== parseInt(id) && !req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

    await pool.query('UPDATE usuarios SET correo = ? WHERE id = ?', [correo, id]);
    res.json({ msg: 'Correo actualizado' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ msg: 'Correo ya registrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

const editarContraseña = async (req, res) => {
  try {
    const { id } = req.params;
    const { contraseña } = req.body;

    if (parseInt(id) === 1) return res.status(403).json({ msg: 'No se puede modificar el usuario 1' });
    if (req.user.id !== parseInt(id) && !req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contraseña, salt);

    await pool.query('UPDATE usuarios SET contraseña = ? WHERE id = ?', [hash, id]);
    res.json({ msg: 'Contraseña actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === 1) return res.status(403).json({ msg: 'No se puede eliminar el usuario 1' });
    if (req.user.id !== parseInt(id) && !req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);

    // Insertar en historial
    await pool.query(
      'INSERT INTO historial_eliminaciones (tipo_entidad, id_entidad, id_usuario) VALUES (?, ?, ?)',
      ['usuario', id, req.user.id]
    );

    res.json({ msg: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    if (!req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

    const [usuarios] = await pool.query('SELECT id, nombre, correo, fecha_creacion, es_admin FROM usuarios');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  editarNombre,
  editarCorreo,
  editarContraseña,
  eliminarUsuario,
  listarUsuarios,
};
