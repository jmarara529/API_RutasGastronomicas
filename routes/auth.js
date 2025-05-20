const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');

// Ruta para registrar un nuevo usuario
router.post('/register', authCtrl.registrar);

// Ruta para iniciar sesión (login)
router.post('/login', authCtrl.login);

module.exports = router;
