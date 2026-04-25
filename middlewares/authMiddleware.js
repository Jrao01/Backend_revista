import jwt from "jsonwebtoken";
import { Usuario } from "../models/index.js";

const checkAuth = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.usuario = await Usuario.findByPk(decoded.id, {
                attributes: ['id', 'nombre', 'apellido', 'correo', 'rol', 'afiliacion_institucional']
            });

            return next();
        } catch (error) {
            return res.status(403).json({ message: "Token no válido o expirado" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "No autorizado, no hay token" });
    }
};

export default checkAuth;
