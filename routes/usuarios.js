// Añadido al inicio
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Obtener todos los usuarios (solo admin)
router.get('/', authMiddleware, isAdmin, async (req, res) => {
    const [usuarios] = await pool.query('SELECT id, nombre, correo, fecha_creacion FROM usuarios');
    res.json(usuarios);
});

// Editar nombre
router.put('/nombre/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    if (req.user.id != id && !req.user.es_admin) return res.status(403).json({ mensaje: 'Acceso denegado' });
    if (parseInt(id) === 1) return res.status(403).json({ mensaje: 'El usuario con ID 1 no puede modificarse' });

    await pool.query('UPDATE usuarios SET nombre = ? WHERE id = ?', [nombre, id]);
    res.json({ mensaje: 'Nombre actualizado' });
});

// Editar correo
router.put('/correo/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { correo } = req.body;
    if (req.user.id != id && !req.user.es_admin) return res.status(403).json({ mensaje: 'Acceso denegado' });
    if (parseInt(id) === 1) return res.status(403).json({ mensaje: 'El usuario con ID 1 no puede modificarse' });

    await pool.query('UPDATE usuarios SET correo = ? WHERE id = ?', [correo, id]);
    res.json({ mensaje: 'Correo actualizado' });
});

// Editar contraseña
router.put('/contraseña/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { contraseña } = req.body;
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(contraseña, 10);

    if (req.user.id != id && !req.user.es_admin) return res.status(403).json({ mensaje: 'Acceso denegado' });
    if (parseInt(id) === 1) return res.status(403).json({ mensaje: 'El usuario con ID 1 no puede modificarse' });

    await pool.query('UPDATE usuarios SET contraseña = ? WHERE id = ?', [hash, id]);
    res.json({ mensaje: 'Contraseña actualizada' });
});

// Eliminar usuario
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    if (req.user.id != id && !req.user.es_admin) return res.status(403).json({ mensaje: 'Acceso denegado' });
    if (parseInt(id) === 1) return res.status(403).json({ mensaje: 'El usuario con ID 1 no puede eliminarse' });

    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    await pool.query('INSERT INTO historial_eliminaciones (tipo_entidad, id_entidad, id_usuario) VALUES (?, ?, ?)', ['usuario', id, req.user.id]);
    res.json({ mensaje: 'Usuario eliminado' });
});

module.exports = router;
