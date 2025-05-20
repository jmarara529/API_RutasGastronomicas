const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const usuarioController = require('../controllers/usuarioController');

// Obtener todos los usuarios (solo admin)
router.get('/', authMiddleware, isAdmin, usuarioController.listarUsuarios);

// Editar nombre de usuario
router.put('/nombre/:id', authMiddleware, usuarioController.editarNombre);

// Editar correo de usuario
router.put('/correo/:id', authMiddleware, usuarioController.editarCorreo);

// Editar contraseña de usuario
router.put('/contraseña/:id', authMiddleware, usuarioController.editarContraseña);

// Eliminar usuario
router.delete('/:id', authMiddleware, usuarioController.eliminarUsuario);

module.exports = router;
