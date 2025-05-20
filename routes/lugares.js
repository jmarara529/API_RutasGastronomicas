const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const lugarController = require('../controllers/lugarController');

// 📌 Obtener todos los lugares registrados en la base de datos
router.get('/', authMiddleware, lugarController.listarLugares);

// 📌 Obtener información de un lugar específico por `place_id`
router.get('/:place_id', authMiddleware, lugarController.obtenerLugar);

// 📌 Registrar un nuevo lugar enviado por la aplicación de escritorio/Android
router.post('/', authMiddleware, lugarController.crearLugar);

// 📌 Actualizar información de un lugar (solo administradores)
router.put('/:place_id', authMiddleware, lugarController.actualizarLugar);

// 📌 Eliminar un lugar (solo administradores)
router.delete('/:place_id', authMiddleware, lugarController.eliminarLugar);

module.exports = router;