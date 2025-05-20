const pool = require('../db');

// 📌 Crear reseña (Solo de lugares que ya están registrados en la base de datos)
const crearResena = async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const { place_id, calificacion, comentario } = req.body;

        if (!calificacion || calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ msg: 'Calificación debe ser entre 1 y 5' });
        }

        // Verificar que el lugar ya existe en la base de datos
        const [[existeLugar]] = await pool.query('SELECT id FROM lugares WHERE place_id = ?', [place_id]);
        if (!existeLugar) {
            return res.status(404).json({ msg: 'El lugar no está registrado. Visítalo primero para que se almacene.' });
        }

        // Insertar la reseña
        await pool.query(
            'INSERT INTO resenas (id_usuario, id_lugar, calificacion, comentario) VALUES (?, ?, ?, ?)',
            [id_usuario, existeLugar.id, calificacion, comentario]
        );

        res.json({ msg: 'Reseña creada correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear la reseña', error: error.message });
    }
};

// 📌 Editar reseña (Solo si es del usuario o un administrador)
const editarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.user.id;
        const { calificacion, comentario } = req.body;

        if (calificacion && (calificacion < 1 || calificacion > 5)) {
            return res.status(400).json({ msg: 'Calificación debe ser entre 1 y 5' });
        }

        // Verificar que la reseña pertenece al usuario o que es admin
        const [[resena]] = await pool.query('SELECT id_usuario FROM resenas WHERE id = ?', [id]);
        if (!resena) return res.status(404).json({ msg: 'Reseña no encontrada' });
        if (resena.id_usuario !== id_usuario && !req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

        // Construir query dinámico
        const campos = [];
        const valores = [];
        if (calificacion !== undefined) {
            campos.push('calificacion = ?');
            valores.push(calificacion);
        }
        if (comentario !== undefined) {
            campos.push('comentario = ?');
            valores.push(comentario);
        }
        if (campos.length === 0) {
            return res.status(400).json({ msg: 'No hay campos para actualizar' });
        }
        valores.push(id);

        const sql = `UPDATE resenas SET ${campos.join(', ')} WHERE id = ?`;
        await pool.query(sql, valores);

        res.json({ msg: 'Reseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al editar la reseña', error: error.message });
    }
};

// 📌 Eliminar reseña (Solo si es del usuario o un administrador)
const eliminarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.user.id;

        // Verificar que la reseña pertenece al usuario o que es admin
        const [[resena]] = await pool.query('SELECT id_usuario FROM resenas WHERE id = ?', [id]);
        if (!resena) return res.status(404).json({ msg: 'Reseña no encontrada' });
        if (resena.id_usuario !== id_usuario && !req.user.es_admin) return res.status(403).json({ msg: 'No autorizado' });

        await pool.query('DELETE FROM resenas WHERE id = ?', [id]);

        // Guardar la eliminación en historial
        await pool.query(
            'INSERT INTO historial_eliminaciones (tipo_entidad, id_entidad, id_usuario) VALUES (?, ?, ?)',
            ['resena', id, req.user.id]
        );

        res.json({ msg: 'Reseña eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar la reseña', error: error.message });
    }
};

// 📌 Listar reseñas
const listarResenas = async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const es_admin = req.user.es_admin;
        const { orden_calificacion, orden_fecha } = req.query;

        let query = `
            SELECT r.*, u.nombre AS nombre_usuario, l.nombre AS nombre_lugar
            FROM resenas r
            JOIN usuarios u ON r.id_usuario = u.id
            JOIN lugares l ON r.id_lugar = l.id
        `;

        const condiciones = [];
        const params = [];

        // Si no es admin, solo mostrar reseñas propias
        if (!es_admin) {
            condiciones.push('r.id_usuario = ?');
            params.push(id_usuario);
        }

        if (condiciones.length > 0) {
            query += ' WHERE ' + condiciones.join(' AND ');
        }

        // Ordenar
        if (orden_calificacion === 'asc' || orden_calificacion === 'desc') {
            query += ` ORDER BY r.calificacion ${orden_calificacion.toUpperCase()}`;
        } else if (orden_fecha === 'reciente') {
            query += ' ORDER BY r.fecha DESC';
        } else if (orden_fecha === 'antigua') {
            query += ' ORDER BY r.fecha ASC';
        } else {
            query += ' ORDER BY r.fecha DESC';
        }

        const [resenas] = await pool.query(query, params);
        res.json(resenas);
    } catch (error) {
        res.status(500).json({ msg: 'Error al listar las reseñas', error: error.message });
    }
};

module.exports = {
    crearResena,
    editarResena,
    eliminarResena,
    listarResenas,
};