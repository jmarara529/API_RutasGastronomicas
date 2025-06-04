const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Controlador para registrar un nuevo usuario
exports.registrar = async (req, res) => {
  const { nombre, correo, contraseña } = req.body;
  try {
    // Verifica si el usuario ya existe
    const [[usuarioExistente]] = await db.execute('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (usuarioExistente) {
      // Registrar intento fallido en historial
      await db.execute(
        'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
        ['usuario', correo, null, 'crear_error']
      );
      console.log('[HISTORIAL] crear_error registrado para', correo);
      return res.status(409).json({ msg: 'Error al registrar', error: 'El usuario ya existe' });
    }
    // Hashea la contraseña antes de guardarla
    const hash = await bcrypt.hash(contraseña, 10);
    // Inserta el nuevo usuario en la base de datos
    const [result] = await db.execute(
      'INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)',
      [nombre, correo, hash]
    );
    // Obtener el id insertado correctamente
    const [[{ id }]] = await db.execute('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    // Añadir registro al historial
    await db.execute(
      'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
      ['usuario', id, id, 'crear_exitoso']
    );
    console.log('[HISTORIAL] crear_exitoso registrado para id', id);
    // Responde con éxito
    res.status(201).json({ msg: 'Usuario creado' });
  } catch (e) {
    // Errores de validación de campos
    if (!nombre || !correo || !contraseña) {
      await db.execute(
        'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
        ['usuario', correo, null, 'crear_error']
      );
      console.log('[HISTORIAL] crear_error registrado para', correo);
      return res.status(400).json({ msg: 'Error al registrar', error: 'Faltan campos obligatorios' });
    }
    // Otros errores internos
    await db.execute(
      'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
      ['usuario', correo, null, 'crear_error']
    );
    console.log('[HISTORIAL] crear_error registrado para', correo, 'error:', e.message);
    res.status(500).json({ msg: 'Error interno al registrar', error: e.message });
  }
};

// Controlador para login de usuario
exports.login = async (req, res) => {
  const { correo, contraseña } = req.body;
  // Busca el usuario por correo
  const [[usuario]] = await db.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);
  // Si no existe o la contraseña no coincide, responde con error
  if (!usuario || !(await bcrypt.compare(contraseña, usuario.contraseña))) {
    return res.status(401).json({ msg: 'Credenciales inválidas' });
  }

  // Genera un token JWT con el id, nombre y es_admin del usuario
  const token = jwt.sign({ id: usuario.id, nombre: usuario.nombre, es_admin: !!usuario.es_admin }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  // Devuelve el token, el campo es_admin y el id al cliente
  res.json({ token, es_admin: !!usuario.es_admin, id: usuario.id }); // <-- esto convierte 0/1 a booleano
};

