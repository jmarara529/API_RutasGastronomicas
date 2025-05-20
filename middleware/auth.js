const jwt = require('jsonwebtoken');

// Middleware de autenticación JWT
module.exports = (req, res, next) => {
    // Obtiene el token del header Authorization (formato: Bearer <token>)
    const token = req.header('Authorization')?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: 'Token no proporcionado' });

    try {
        // Verifica y decodifica el token usando la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Guarda los datos del usuario en la petición
        next(); // Continúa con la siguiente función/middleware
    } catch {
        // Si el token es inválido o expiró, responde con error
        res.status(401).json({ msg: 'Token inválido' });
    }
};