export const checkRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                message: "No autorizado, primero debe iniciar sesión"
            });
        }
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                message: "No tiene permisos para acceder a este recurso"
            });
        }
        next();
    };
};
