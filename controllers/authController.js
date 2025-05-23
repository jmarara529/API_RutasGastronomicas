const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Controlador para registrar un nuevo usuario
exports.registrar = async (req, res) => {
  const { nombre, correo, contraseña } = req.body;
  // Hashea la contraseña antes de guardarla
  const hash = await bcrypt.hash(contraseña, 10);
  try {
    // Inserta el nuevo usuario en la base de datos
    const [result] = await db.execute(
      'INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)',
      [nombre, correo, hash]
    );
    // Responde con éxito
    res.status(201).json({ msg: 'Usuario creado' });
  } catch (e) {
    // Si hay error (por ejemplo, correo duplicado), responde con error
    res.status(400).json({ msg: 'Error al registrar', error: e.message });
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

  // Genera un token JWT con el id y nombre del usuario
  const token = jwt.sign({ id: usuario.id, nombre: usuario.nombre }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  // Devuelve el token al cliente
  res.json({ token });
};

