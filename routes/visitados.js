const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const visitadosController = require('../controllers/visitadosController');

// Obtener los lugares visitados por el usuario autenticado
router.get('/', authMiddleware, visitadosController.listarVisitadosUsuario);

// Obtener todas las visitas (solo admin, con filtros opcionales)
router.get('/admin', authMiddleware, isAdmin, visitadosController.listarVisitadosAdmin);

// Registrar una visita
router.post('/', authMiddleware, visitadosController.marcarVisitado);

// Eliminar una visita
router.delete('/:id_lugar', authMiddleware, visitadosController.eliminarVisitado);

module.exports = router;