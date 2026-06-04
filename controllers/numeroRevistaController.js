import { Op } from 'sequelize';
import { NumeroRevista, Volumen, Revista } from '../models/index.js';

const parseIds = (req) => ({
    revistaId: parseInt(req.params.revId ?? req.params.revistaId, 10),
    volId: parseInt(req.params.volId, 10),
    numId: req.params.numId ? parseInt(req.params.numId, 10) : null
});

const obtenerVolumenDeRevista = async (revistaId, volId) => {
    return Volumen.findOne({
        where: { id: volId, revista_id: revistaId }
    });
};

export const listNumeros = async (req, res) => {
    try {
        const { revistaId, volId } = parseIds(req);
        const volumen = await obtenerVolumenDeRevista(revistaId, volId);
        if (!volumen) {
            return res.status(404).json({ message: 'Volumen no encontrado para esta revista' });
        }

        const numeros = await NumeroRevista.findAll({
            where: { volumen_id: volId },
            order: [['numero', 'ASC']]
        });

        res.json(numeros);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener números', error: error.message });
    }
};

export const getNumeroById = async (req, res) => {
    try {
        const { revistaId, volId, numId } = parseIds(req);
        const volumen = await obtenerVolumenDeRevista(revistaId, volId);
        if (!volumen) {
            return res.status(404).json({ message: 'Volumen no encontrado para esta revista' });
        }

        const numero = await NumeroRevista.findOne({
            where: { id: numId, volumen_id: volId, revista_id: revistaId }
        });
        if (!numero) {
            return res.status(404).json({ message: 'Número no encontrado' });
        }

        res.json(numero);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener número', error: error.message });
    }
};

export const createNumero = async (req, res) => {
    try {
        const { revistaId, volId } = parseIds(req);
        const { numero, anio, titulo_edicion, status, fecha_publicacion } = req.body;

        const volumen = await obtenerVolumenDeRevista(revistaId, volId);
        if (!volumen) {
            return res.status(404).json({ message: 'Volumen no encontrado para esta revista' });
        }

        const duplicado = await NumeroRevista.findOne({
            where: { volumen_id: volId, numero }
        });
        if (duplicado) {
            return res.status(409).json({
                message: 'Ya existe un número con esa edición en este volumen',
                numero_existente_id: duplicado.id
            });
        }

        const nuevoNumero = await NumeroRevista.create({
            revista_id: revistaId,
            volumen_id: volId,
            numero,
            anio,
            titulo_edicion,
            status: status || 'futuro',
            fecha_publicacion
        });

        res.status(201).json({
            message: 'Número de revista creado correctamente',
            numero: nuevoNumero
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: 'Ya existe un número con esa edición en este volumen'
            });
        }
        res.status(500).json({ message: 'Error al crear número de revista', error: error.message });
    }
};

export const updateNumero = async (req, res) => {
    try {
        const { revistaId, volId, numId } = parseIds(req);
        const { numero, anio, titulo_edicion, status, fecha_publicacion } = req.body;

        const volumen = await obtenerVolumenDeRevista(revistaId, volId);
        if (!volumen) {
            return res.status(404).json({ message: 'Volumen no encontrado para esta revista' });
        }

        const registro = await NumeroRevista.findOne({
            where: { id: numId, volumen_id: volId, revista_id: revistaId }
        });
        if (!registro) {
            return res.status(404).json({ message: 'Número no encontrado' });
        }

        if (numero !== undefined && numero !== registro.numero) {
            const duplicado = await NumeroRevista.findOne({
                where: {
                    volumen_id: volId,
                    numero,
                    id: { [Op.ne]: numId }
                }
            });
            if (duplicado) {
                return res.status(409).json({
                    message: 'Ya existe otro número con esa edición en este volumen'
                });
            }
            registro.numero = numero;
        }

        if (anio !== undefined) registro.anio = anio;
        if (titulo_edicion !== undefined) registro.titulo_edicion = titulo_edicion;
        if (status !== undefined) registro.status = status;
        if (fecha_publicacion !== undefined) registro.fecha_publicacion = fecha_publicacion;

        await registro.save();
        res.json({ message: 'Número actualizado correctamente', numero: registro });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: 'Ya existe un número con esa edición en este volumen'
            });
        }
        res.status(500).json({ message: 'Error al actualizar número', error: error.message });
    }
};

export const deleteNumero = async (req, res) => {
    try {
        const { revistaId, volId, numId } = parseIds(req);

        const registro = await NumeroRevista.findOne({
            where: { id: numId, volumen_id: volId, revista_id: revistaId }
        });
        if (!registro) {
            return res.status(404).json({ message: 'Número no encontrado' });
        }

        await registro.destroy();
        res.json({ message: 'Número eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar número', error: error.message });
    }
};
