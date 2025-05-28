const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');

// Buscar lugares por texto
router.get('/buscar', placesController.buscarLugar);

// Buscar lugares cercanos a unas coordenadas
router.get('/cercanos', placesController.buscarCercanos);

// Obtener detalles de un lugar por place_id
router.get('/detalles', placesController.detallesLugar);

module.exports = router;