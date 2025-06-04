const pool = require('../db');
const bcrypt = require('bcryptjs');

// Editar el nombre de un usuario
const editarNombre = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    // No se permite modificar el usuario con id 1
    if (parseInt(id) === 1) return res.status(403).json({ msg: 'No se puede modificar el usuario 1' });
    // Solo el propio usuario o un admin pueden modificar
    if (req.user.id !== parseInt(id) && !req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

    // Actualiza el nombre en la base de datos
    await pool.query('UPDATE usuarios SET nombre = ? WHERE id = ?', [nombre, id]);
    res.json({ msg: 'Nombre actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Editar el correo de un usuario
const editarCorreo = async (req, res) => {
  try {
    const { id } = req.params;
    const { correo } = req.body;

    // No se permite modificar el usuario con id 1
    if (parseInt(id) === 1) return res.status(403).json({ msg: 'No se puede modificar el usuario 1' });
    // Solo el propio usuario o un admin pueden modificar
    if (req.user.id !== parseInt(id) && !req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

    // Actualiza el correo en la base de datos
    await pool.query('UPDATE usuarios SET correo = ? WHERE id = ?', [correo, id]);
    res.json({ msg: 'Correo actualizado' });
  } catch (error) {
    // Si el correo ya existe, devuelve error específico
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ msg: 'Correo ya registrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Editar la contraseña de un usuario
const editarContraseña = async (req, res) => {
  try {
    const { id } = req.params;
    const { contraseña } = req.body;

    // No se permite modificar el usuario con id 1
    if (parseInt(id) === 1) return res.status(403).json({ msg: 'No se puede modificar el usuario 1' });
    // Solo el propio usuario o un admin pueden modificar
    if (req.user.id !== parseInt(id) && !req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

    // Hashea la nueva contraseña antes de guardarla
    const hash = await bcrypt.hash(contraseña, 10);

    // Actualiza la contraseña en la base de datos
    await pool.query('UPDATE usuarios SET contraseña = ? WHERE id = ?', [hash, id]);
    res.json({ msg: 'Contraseña actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un usuario
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // No se permite eliminar el usuario con id 1
    if (parseInt(id) === 1) return res.status(403).json({ msg: 'No se puede eliminar el usuario 1' });
    // Solo el propio usuario o un admin pueden eliminar
    if (req.user.id !== parseInt(id) && !req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

    // Elimina el usuario de la base de datos
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);

    // Registra la eliminación en el historial
    await pool.query(
      'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
      ['usuario', id, req.user.id, 'eliminar']
    );

    res.json({ msg: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar todos los usuarios (admin: todos, usuario normal: solo su info)
const listarUsuarios = async (req, res) => {
  try {
    if (req.user.es_admin) {
      // Admin: lista todos los usuarios
      const [usuarios] = await pool.query('SELECT id, nombre, correo, fecha_creacion, es_admin FROM usuarios');
      return res.json(usuarios);
    } else {
      // Usuario normal: solo su propio usuario
      const [usuarios] = await pool.query('SELECT id, nombre, correo, fecha_creacion, es_admin FROM usuarios WHERE id = ?', [req.user.id]);
      return res.json(usuarios);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener solo el usuario autenticado
const obtenerUsuarioAutenticado = async (req, res) => {
  try {
    const [usuarios] = await pool.query('SELECT id, nombre, correo, fecha_creacion, es_admin FROM usuarios WHERE id = ?', [req.user.id]);
    if (!usuarios.length) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json(usuarios[0]);
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
  obtenerUsuarioAutenticado,
};
