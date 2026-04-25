import {
    Usuario,
    Articulo
} from "../models/index.js";
import bycrpt from "bcrypt";
import jwt from "jsonwebtoken";

export const obtenerUsuarios = async (req, res) => {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
}

export const obtenerUsuario = async (req, res) => {
    const {
        id
    } = req.params;

    try {
        const usuario = await Usuario.findByPk(id, {
            include: [
                {
                    model: Articulo,
                    as: 'articulos_principales'
                }
            ]
        });
        if (!usuario) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }
        res.json(usuario);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error al obtener usuario"
        });
    }
}


export const actualizarUsuario = async (req, res) => {
    const usuario = await Usuario.findByPk(req.params.id);
    const {
        nombre,
        apellido,
        correo,
        password,
        orcid,
        afiliacion_institucional,
    } = req.body;

    if (nombre) usuario.nombre = nombre;
    if (apellido) usuario.apellido = apellido;
    if (correo) usuario.correo = correo;
    if (password) usuario.password = password;
    if (orcid) usuario.orcid = orcid;
    if (afiliacion_institucional) usuario.afiliacion_institucional = afiliacion_institucional;
    await usuario.save();
    res.json({
        message: "Usuario actualizado correctamente"
    });
}

export const crearUsuario = async (req, res) => {
    const {
        nombre,
        apellido,
        correo,
        password,
        orcid,
        afiliacion_institucional,
        rol
    } = req.body;

    try {
        const usuarioExiste = await Usuario.findOne({
            where: {
                correo
            }
        });
        if (usuarioExiste) {
            return res.status(400).json({
                message: "El correo electrónico proporcionado ya se encuentra registrado"
            });
        }
        const salt = await bycrpt.genSalt(10);
        const hashPassword = await bycrpt.hash(password, salt);
        await Usuario.create({
            nombre,
            apellido,
            correo,
            password: hashPassword,
            orcid,
            afiliacion_institucional,
            rol
        });
        res.json({
            message: "El usuario ha sido registrado exitosamente"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error al registrar usuario"
        });
    }
}

export const loginUsuario = async (req, res) => {
    const { correo, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ where: { correo } });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario o contraseña incorrectos" });
        }

        const validPassword = await bycrpt.compare(password, usuario.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }

        const token = jwt.sign(
            { 
                id: usuario.id, 
                rol: usuario.rol,
                correo: usuario.correo
            },
            process.env.JWT_SECRET || 'secreto_revista_cientifica_12345',
            { expiresIn: '1d' }
        );

        res.json({
            message: "Login exitoso",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo,
                rol: usuario.rol,
                afiliacion_institucional: usuario.afiliacion_institucional
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al iniciar sesión" });
    }
}