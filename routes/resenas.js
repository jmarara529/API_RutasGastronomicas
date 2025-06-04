const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const resenaController = require('../controllers/resenaController');

// Ruta para crear una reseña (requiere autenticación)
router.post('/', authMiddleware, resenaController.crearResena);

// Ruta para editar una reseña (requiere autenticación)
router.put('/:id', authMiddleware, resenaController.editarResena);

// Ruta para eliminar una reseña (requiere autenticación)
router.delete('/:id', authMiddleware, resenaController.eliminarResena);

// Ruta para listar reseñas con filtros y permisos (requiere autenticación SIEMPRE)
router.get('/', authMiddleware, resenaController.listarResenas);

// Ruta para obtener las reseñas del usuario autenticado
router.get('/usuario', authMiddleware, resenaController.listarResenasUsuario);

// Ruta para listar reseñas de cualquier usuario (solo para admin)
router.get('/usuario/:id', authMiddleware, isAdmin, resenaController.listarResenasDeUsuario);

module.exports = router;
