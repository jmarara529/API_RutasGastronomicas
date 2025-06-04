const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const usuarioController = require('../controllers/usuarioController');

// Obtener el usuario autenticado
router.get('/me', authMiddleware, usuarioController.obtenerUsuarioAutenticado);

// Obtener todos los usuarios (solo admin)
router.get('/', authMiddleware, isAdmin, usuarioController.listarUsuarios);

// Obtener datos de un usuario específico (solo admin)
router.get('/:id', authMiddleware, isAdmin, usuarioController.obtenerUsuarioPorId);

// Editar nombre de usuario
router.put('/nombre/:id', authMiddleware, usuarioController.editarNombre);

// Editar correo de usuario
router.put('/correo/:id', authMiddleware, usuarioController.editarCorreo);

// Editar contraseña de usuario
router.put('/contrasena/:id', authMiddleware, usuarioController.editarContraseña);

// Editar todos los datos de usuario (solo admin)
router.put('/:id', authMiddleware, isAdmin, usuarioController.editarUsuarioAdmin);

// Eliminar usuario
router.delete('/:id', authMiddleware, usuarioController.eliminarUsuario);

module.exports = router;
