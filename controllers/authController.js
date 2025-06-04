const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ========================= REGISTRO DE USUARIO =========================
// Registra un nuevo usuario y lo audita en historial_acciones
exports.registrar = async (req, res) => {
  const { nombre, correo, contraseña } = req.body;
  try {
    // Verificar si el usuario ya existe
    const [[usuarioExistente]] = await db.execute('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (usuarioExistente) {
      // Auditar intento fallido
      await db.execute(
        'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
        ['usuario', correo, null, 'crear_error']
      );
      return res.status(409).json({ msg: 'Error al registrar', error: 'El usuario ya existe' });
    }
    // Hashear la contraseña
    const hash = await bcrypt.hash(contraseña, 10);
    // Insertar usuario
    await db.execute(
      'INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)',
      [nombre, correo, hash]
    );
    // Obtener el id del usuario recién creado
    const [[{ id }]] = await db.execute('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    // Auditar registro exitoso
    await db.execute(
      'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
      ['usuario', id, id, 'crear_exitoso']
    );
    res.status(201).json({ msg: 'Usuario creado' });
  } catch (e) {
    // Auditar errores de validación o internos
    await db.execute(
      'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
      ['usuario', correo, null, 'crear_error']
    );
    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({ msg: 'Error al registrar', error: 'Faltan campos obligatorios' });
    }
    res.status(500).json({ msg: 'Error interno al registrar', error: e.message });
  }
};

// ========================= LOGIN DE USUARIO =========================
// Autentica usuario y devuelve token JWT
exports.login = async (req, res) => {
  const { correo, contraseña } = req.body;
  // Buscar usuario por correo
  const [[usuario]] = await db.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);
  // Validar existencia y contraseña
  if (!usuario || !(await bcrypt.compare(contraseña, usuario.contraseña))) {
    return res.status(401).json({ msg: 'Credenciales inválidas' });
  }
  // Generar token JWT
  const token = jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, es_admin: !!usuario.es_admin },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  // Responder con token y datos relevantes
  res.json({ token, es_admin: !!usuario.es_admin, id: usuario.id });
};

