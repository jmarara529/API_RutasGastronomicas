const pool = require('../db');
const bcrypt = require('bcryptjs');

// Crear usuario (registro)
const crearUsuario = async (req, res) => {
  try {
    const { nombre, correo, contraseña } = req.body;
    if (!nombre || !correo || !contraseña) return res.status(400).json({ msg: 'Faltan datos obligatorios' });
    const hash = await bcrypt.hash(contraseña, 10);
    try {
      const [result] = await pool.query('INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)', [nombre, correo, hash]);
      // Si es el primer usuario (id=1), hacerlo admin
      if (result.insertId === 1) {
        await pool.query('UPDATE usuarios SET es_admin = 1 WHERE id = 1');
      }
      await pool.query(
        'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
        ['usuario', result.insertId, result.insertId, 'crear_exitoso']
      );
      res.status(201).json({ msg: 'Usuario creado', id: result.insertId });
    } catch (error) {
      // Si el usuario no se pudo crear, intenta registrar el error en historial (sin id_usuario válido)
      await pool.query(
        'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
        ['usuario', correo, null, 'crear_error']
      );
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ msg: 'Correo ya registrado' });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
    if (parseInt(id) === 1) return res.status(403).json({ msg: 'No se puede eliminar el usuario 1' });
    if (req.user.id !== parseInt(id) && !req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });
    // Intentar eliminar usuario
    try {
      await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
      await pool.query(
        'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
        ['usuario', id, req.user.id, 'eliminar_exitoso']
      );
      res.json({ msg: 'Usuario eliminado' });
    } catch (error) {
      await pool.query(
        'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
        ['usuario', id, req.user.id, 'eliminar_error']
      );
      throw error;
    }
  } catch (error) {
    console.error('[ERROR][eliminarUsuario]', error);
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

// Obtener usuario por id (solo admin)
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    // No se permite mostrar el usuario con id 1
    if (parseInt(id) === 1) return res.status(403).json({ msg: 'No se puede mostrar el usuario 1' });
    const [usuarios] = await pool.query('SELECT id, nombre, correo, fecha_creacion, es_admin FROM usuarios WHERE id = ?', [id]);
    if (!usuarios.length) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json(usuarios[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Editar todos los datos de un usuario (solo admin)
const editarUsuarioAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, password, es_admin } = req.body;
    if (parseInt(id) === 1) return res.status(403).json({ msg: 'No se puede modificar el usuario 1' });
    // Solo admin puede usar este endpoint
    if (!req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });
    // Construir query dinámico
    const campos = [];
    const valores = [];
    if (nombre) { campos.push('nombre = ?'); valores.push(nombre); }
    if (correo) { campos.push('correo = ?'); valores.push(correo); }
    if (typeof es_admin !== 'undefined') { campos.push('es_admin = ?'); valores.push(!!es_admin); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      campos.push('contraseña = ?');
      valores.push(hash);
    }
    if (campos.length === 0) return res.status(400).json({ msg: 'No hay datos para actualizar' });
    valores.push(id);
    await pool.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, valores);
    res.json({ msg: 'Usuario actualizado' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ msg: 'Correo ya registrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearUsuario,
  editarNombre,
  editarCorreo,
  editarContraseña,
  eliminarUsuario,
  listarUsuarios,
  obtenerUsuarioAutenticado,
  obtenerUsuarioPorId,
  editarUsuarioAdmin,
};
