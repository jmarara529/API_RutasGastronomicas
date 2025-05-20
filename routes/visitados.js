const express = require('express');
const router = express.Router();
const pool = require('../db'); // Conexión a la base de datos
const authMiddleware = require('../middleware/auth'); // Corrección de la ruta
const isAdmin = require('../middleware/isAdmin'); // Corrección de la ruta

// 📌 Obtener los lugares visitados por un usuario
router.get('/', authMiddleware, async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const [visitados] = await pool.query(`
            SELECT v.*, l.nombre AS nombre_lugar
            FROM visitados v
            JOIN lugares l ON v.id_lugar = l.id
            WHERE v.id_usuario = ?
            ORDER BY v.fecha_visita DESC
        `, [id_usuario]);

        res.json(visitados);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener los lugares visitados', error: error.message });
    }
});

// 📌 Obtener todas las visitas (Solo para administradores con filtros opcionales)
router.get('/admin', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { id_usuario, id_lugar } = req.query;
        let query = `
            SELECT v.*, u.nombre AS nombre_usuario, l.nombre AS nombre_lugar 
            FROM visitados v 
            JOIN usuarios u ON v.id_usuario = u.id 
            JOIN lugares l ON v.id_lugar = l.id
            WHERE 1=1
        `;
        const params = [];

        if (id_usuario) {
            query += ' AND v.id_usuario = ?';
            params.push(id_usuario);
        }

        if (id_lugar) {
            query += ' AND v.id_lugar = ?';
            params.push(id_lugar);
        }

        const [visitados] = await pool.query(query, params);
        res.json(visitados);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener todas las visitas', error: error.message });
    }
});

// 📌 Registrar una visita
router.post('/', authMiddleware, async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const { id_lugar } = req.body;

        if (!id_lugar) {
            return res.status(400).json({ msg: 'El ID del lugar es obligatorio' });
        }

        await pool.query('INSERT INTO visitados (id_usuario, id_lugar) VALUES (?, ?)', [id_usuario, id_lugar]);
        res.json({ msg: 'Visita registrada correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al registrar la visita', error: error.message });
    }
});

// 📌 Eliminar una visita
router.delete('/:id_lugar', authMiddleware, async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const { id_lugar } = req.params;

        const [resultado] = await pool.query('DELETE FROM visitados WHERE id_usuario = ? AND id_lugar = ?', [id_usuario, id_lugar]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ msg: 'Visita no encontrada' });
        }

        // Registrar en historial
        await pool.query(
            'INSERT INTO historial_eliminaciones (tipo_entidad, id_entidad, id_usuario) VALUES (?, ?, ?)',
            ['visitado', id_lugar, id_usuario]
        );

        res.json({ msg: 'Visita eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar la visita', error: error.message });
    }
});

module.exports = router;