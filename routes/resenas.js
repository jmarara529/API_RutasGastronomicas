const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const resenaController = require('../controllers/resenaController');

// Crear reseña
router.post('/', authMiddleware, resenaController.crearResena);

// Editar reseña
router.put('/:id', authMiddleware, resenaController.editarResena);

// Eliminar reseña
router.delete('/:id', authMiddleware, resenaController.eliminarResena);

// Listar reseñas con filtros y permisos
router.get('/', authMiddleware, resenaController.listarResenas);

module.exports = router;
