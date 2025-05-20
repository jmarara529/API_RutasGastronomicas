// Middleware para verificar si el usuario es administrador
module.exports = (req, res, next) => {
    // Si no hay usuario autenticado o no es admin, deniega el acceso
    if (!req.user || !req.user.es_admin) {
        return res.status(403).json({ msg: 'Acceso denegado. Se requiere privilegios de administrador.' });
    }
    // Si es admin, continúa con la siguiente función/middleware
    next();
};