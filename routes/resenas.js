const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const resenaController = require('../controllers/resenaController');

// Ruta para crear una reseña (requiere autenticación)
router.post('/', authMiddleware, resenaController.crearResena);

// Ruta para editar una reseña (requiere autenticación)
router.put('/:id', authMiddleware, resenaController.editarResena);

// Ruta para eliminar una reseña (requiere autenticación)
router.delete('/:id', authMiddleware, resenaController.eliminarResena);

// Ruta para listar reseñas con filtros y permisos (requiere autenticación)
router.get('/', authMiddleware, resenaController.listarResenas);

module.exports = router;
