const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registrar = async (req, res) => {
  const { nombre, correo, contraseña } = req.body;
  const hash = await bcrypt.hash(contraseña, 10);
  try {
    const [result] = await db.execute(
      'INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)',
      [nombre, correo, hash]
    );
    res.status(201).json({ msg: 'Usuario creado' });
  } catch (e) {
    res.status(400).json({ msg: 'Error al registrar', error: e.message });
  }
};

exports.login = async (req, res) => {
  const { correo, contraseña } = req.body;
  const [[usuario]] = await db.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);
  if (!usuario || !(await bcrypt.compare(contraseña, usuario.contraseña))) {
    return res.status(401).json({ msg: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ id: usuario.id, nombre: usuario.nombre }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  res.json({ token });
};
