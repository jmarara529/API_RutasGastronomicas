const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const historialController = require('../controllers/historialController');

// Ruta para obtener el historial de acciones (solo admin)
router.get('/', authMiddleware, isAdmin, historialController.obtenerHistorial);

module.exports = router;