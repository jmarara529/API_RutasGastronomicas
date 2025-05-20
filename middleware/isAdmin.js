module.exports = (req, res, next) => {
    if (!req.user || !req.user.es_admin) {
        return res.status(403).json({ msg: 'Acceso denegado. Se requiere privilegios de administrador.' });
    }
    next();
};