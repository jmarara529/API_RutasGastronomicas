const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const favoritosCtrl = require('../controllers/favoritosController');

router.post('/', auth, favoritosCtrl.agregarFavorito);
router.get('/', auth, favoritosCtrl.listarFavoritos);
router.delete('/:id_lugar', auth, favoritosCtrl.eliminarFavorito);

module.exports = router;
