const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const favoritosCtrl = require('../controllers/favoritosController');

// Ruta para agregar un lugar a favoritos (requiere autenticación)
router.post('/', auth, favoritosCtrl.agregarFavorito);

// Ruta para listar los lugares favoritos del usuario autenticado
router.get('/', auth, favoritosCtrl.listarFavoritos);

// Ruta para eliminar un lugar de favoritos del usuario autenticado
router.delete('/:id_lugar', auth, favoritosCtrl.eliminarFavorito);

module.exports = router;
