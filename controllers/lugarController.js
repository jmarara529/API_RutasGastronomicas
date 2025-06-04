const pool = require('../db');

// Listar todos los lugares
const listarLugares = async (req, res) => {
    try {
        const [lugares] = await pool.query('SELECT * FROM lugares ORDER BY nombre ASC');
        res.json(lugares);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener lugares', error: error.message });
    }
};

// Obtener información de un lugar por place_id
const obtenerLugar = async (req, res) => {
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
};

// Registrar un nuevo lugar
const crearLugar = async (req, res) => {
    try {
        const { place_id, nombre, direccion, categoria, ciudad } = req.body;
        if (!place_id || !nombre || !direccion || !categoria || !ciudad) {
            return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
        }
        const [[existeLugar]] = await pool.query('SELECT id FROM lugares WHERE place_id = ?', [place_id]);
        if (existeLugar) {
            return res.status(409).json({ msg: 'El lugar ya está registrado' });
        }
        await pool.query(
            'INSERT INTO lugares (place_id, nombre, direccion, categoria, ciudad) VALUES (?, ?, ?, ?, ?)',
            [place_id, nombre, direccion, categoria, ciudad]
        );
        // Obtener el id del lugar recién creado
        const [[nuevoLugar]] = await pool.query('SELECT id FROM lugares WHERE place_id = ?', [place_id]);
        // Registrar en historial de acciones
        await pool.query(
            'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
            ['lugar', place_id, req.user.id, 'crear']
        );
        res.status(201).json({ msg: 'Lugar creado exitosamente', lugar: { id: nuevoLugar.id, place_id, nombre, direccion, categoria, ciudad } });
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear el lugar', error: error.message });
    }
};

// Actualizar información de un lugar
const actualizarLugar = async (req, res) => {
    try {
        const { place_id } = req.params;
        const { nombre, direccion, categoria, ciudad } = req.body;
        const [result] = await pool.query('UPDATE lugares SET nombre = ?, direccion = ?, categoria = ?, ciudad = ? WHERE place_id = ?', [
            nombre,
            direccion,
            categoria,
            ciudad,
            place_id,
        ]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'El lugar no está registrado en la base de datos' });
        }
        // Registrar en historial de acciones
        await pool.query(
            'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
            ['lugar', place_id, req.user.id, 'actualizar']
        );
        res.json({ msg: 'Lugar actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar el lugar', error: error.message });
    }
};

// Eliminar un lugar
const eliminarLugar = async (req, res) => {
    try {
        const { place_id } = req.params;
        const [result] = await pool.query('DELETE FROM lugares WHERE place_id = ?', [place_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'El lugar no está registrado en la base de datos' });
        }
        // Registrar en historial de acciones
        await pool.query(
            'INSERT INTO historial_acciones (tipo_entidad, id_entidad, id_usuario, accion) VALUES (?, ?, ?, ?)',
            ['lugar', place_id, req.user.id, 'eliminar']
        );
        res.json({ msg: 'Lugar eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar el lugar', error: error.message });
    }
};

module.exports = {
    listarLugares,
    obtenerLugar,
    crearLugar,
    actualizarLugar,
    eliminarLugar,
};
