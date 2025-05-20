const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// 📌 Obtener todos los lugares registrados en la base de datos
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [lugares] = await pool.query('SELECT * FROM lugares ORDER BY nombre ASC');
        res.json(lugares);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener lugares', error: error.message });
    }
});

// 📌 Obtener información de un lugar específico por `place_id`
router.get('/:place_id', authMiddleware, async (req, res) => {
    try {
        const { place_id } = req.params;
        const [[lugar]] = await pool.query('SELECT * FROM lugares WHERE place_id = ?', [place_id]);

        if (!lugar) {
            return res.status(404).json({ msg: 'El lugar no está registrado en la base de datos' });
        }

        res.json(lugar);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener el lugar', error: error.message });
    }
});

// 📌 Registrar un nuevo lugar enviado por la aplicación de escritorio/Android
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { place_id, nombre, direccion, categoria, ciudad } = req.body;

        if (!place_id || !nombre || !direccion || !categoria || !ciudad) {
            return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
        }

        // Verificar si el lugar ya está en la base de datos
        const [[existeLugar]] = await pool.query('SELECT id FROM lugares WHERE place_id = ?', [place_id]);
        if (existeLugar) {
            return res.status(409).json({ msg: 'El lugar ya está registrado' });
        }

        // Insertar el nuevo lugar
        await pool.query(
            'INSERT INTO lugares (place_id, nombre, direccion, categoria, ciudad) VALUES (?, ?, ?, ?, ?)',
            [place_id, nombre, direccion, categoria, ciudad]
        );

        res.status(201).json({ msg: 'Lugar registrado correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al registrar el lugar', error: error.message });
    }
});

// 📌 Actualizar información de un lugar (solo administradores)
router.put('/:place_id', authMiddleware, async (req, res) => {
    try {
        const { place_id } = req.params;
        const { nombre, direccion, categoria, ciudad } = req.body;

        // Verificar que el lugar existe
        const [[lugar]] = await pool.query('SELECT id FROM lugares WHERE place_id = ?', [place_id]);
        if (!lugar) {
            return res.status(404).json({ msg: 'El lugar no está registrado en la base de datos' });
        }

        // Construir la actualización dinámicamente
        const campos = [];
        const valores = [];
        if (nombre) {
            campos.push('nombre = ?');
            valores.push(nombre);
        }
        if (direccion) {
            campos.push('direccion = ?');
            valores.push(direccion);
        }
        if (categoria) {
            campos.push('categoria = ?');
            valores.push(categoria);
        }
        if (ciudad) {
            campos.push('ciudad = ?');
            valores.push(ciudad);
        }

        if (campos.length === 0) {
            return res.status(400).json({ msg: 'No hay campos para actualizar' });
        }

        valores.push(place_id);
        const sql = `UPDATE lugares SET ${campos.join(', ')} WHERE place_id = ?`;
        await pool.query(sql, valores);

        res.json({ msg: 'Lugar actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar el lugar', error: error.message });
    }
});

// 📌 Eliminar un lugar (solo administradores)
router.delete('/:place_id', authMiddleware, async (req, res) => {
    try {
        const { place_id } = req.params;

        // Verificar que el lugar existe antes de eliminarlo
        const [[lugar]] = await pool.query('SELECT id FROM lugares WHERE place_id = ?', [place_id]);
        if (!lugar) {
            return res.status(404).json({ msg: 'El lugar no está registrado en la base de datos' });
        }

        await pool.query('DELETE FROM lugares WHERE place_id = ?', [place_id]);

        // Guardar la eliminación en historial
        await pool.query(
            'INSERT INTO historial_eliminaciones (tipo_entidad, id_entidad, id_usuario) VALUES (?, ?, ?)',
            ['lugar', place_id, req.user.id]
        );

        res.json({ msg: 'Lugar eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar el lugar', error: error.message });
    }
});

module.exports = router;