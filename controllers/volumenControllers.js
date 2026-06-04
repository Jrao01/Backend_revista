import { Op } from 'sequelize';
import { Volumen, Revista, NumeroRevista } from '../models/index.js';

const parseRevistaId = (req) => parseInt(req.params.revId ?? req.params.revistaId, 10);

export const listVolumenes = async (req, res) => {
    try {
        const revistaId = parseRevistaId(req);
        const revista = await Revista.findByPk(revistaId);
        if (!revista) {
            return res.status(404).json({ message: 'Revista no encontrada' });
        }

        const volumenes = await Volumen.findAll({
            where: { revista_id: revistaId },
            include: [{ model: NumeroRevista, as: 'numeros' }],
            order: [['numero_volumen', 'ASC']]
        });

        res.json(volumenes);
    } catch (error) {
        res.status(500).json({ message: 'Error al listar volúmenes', error: error.message });
    }
};

export const getVolumenById = async (req, res) => {
    try {
        const revistaId = parseRevistaId(req);
        const volId = parseInt(req.params.volId, 10);

        const volumen = await Volumen.findOne({
            where: { id: volId, revista_id: revistaId },
            include: [{ model: NumeroRevista, as: 'numeros' }]
        });

        if (!volumen) {
            return res.status(404).json({ message: 'Volumen no encontrado' });
        }

        res.json(volumen);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener volumen', error: error.message });
    }
};

export const createVolumen = async (req, res) => {
    try {
        const revistaId = parseRevistaId(req);
        const { numero_volumen } = req.body;

        const revista = await Revista.findByPk(revistaId);
        if (!revista) {
            return res.status(404).json({ message: 'Revista no encontrada' });
        }

        const duplicado = await Volumen.findOne({
            where: { revista_id: revistaId, numero_volumen }
        });
        if (duplicado) {
            return res.status(409).json({
                message: 'Ya existe un volumen con ese número para esta revista',
                volumen_existente_id: duplicado.id
            });
        }

        const volumen = await Volumen.create({
            revista_id: revistaId,
            numero_volumen
        });

        res.status(201).json({
            message: 'Volumen creado correctamente',
            volumen
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: 'Ya existe un volumen con ese número para esta revista'
            });
        }
        res.status(500).json({ message: 'Error al crear volumen', error: error.message });
    }
};

export const updateVolumen = async (req, res) => {
    try {
        const revistaId = parseRevistaId(req);
        const volId = parseInt(req.params.volId, 10);
        const { numero_volumen } = req.body;

        const volumen = await Volumen.findOne({
            where: { id: volId, revista_id: revistaId }
        });
        if (!volumen) {
            return res.status(404).json({ message: 'Volumen no encontrado' });
        }

        if (numero_volumen !== undefined && numero_volumen !== volumen.numero_volumen) {
            const duplicado = await Volumen.findOne({
                where: {
                    revista_id: revistaId,
                    numero_volumen,
                    id: { [Op.ne]: volId }
                }
            });
            if (duplicado) {
                return res.status(409).json({
                    message: 'Ya existe otro volumen con ese número en esta revista'
                });
            }
            volumen.numero_volumen = numero_volumen;
        }

        await volumen.save();
        res.json({ message: 'Volumen actualizado correctamente', volumen });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: 'Ya existe un volumen con ese número para esta revista'
            });
        }
        res.status(500).json({ message: 'Error al actualizar volumen', error: error.message });
    }
};

export const deleteVolumen = async (req, res) => {
    try {
        const revistaId = parseRevistaId(req);
        const volId = parseInt(req.params.volId, 10);

        const volumen = await Volumen.findOne({
            where: { id: volId, revista_id: revistaId }
        });
        if (!volumen) {
            return res.status(404).json({ message: 'Volumen no encontrado' });
        }

        const numerosAsociados = await NumeroRevista.count({ where: { volumen_id: volId } });
        if (numerosAsociados > 0) {
            return res.status(400).json({
                message: 'No se puede eliminar el volumen: tiene números asociados'
            });
        }

        await volumen.destroy();
        res.json({ message: 'Volumen eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar volumen', error: error.message });
    }
};

/** GET /api/volumenes — todos los volúmenes (con revista) */
export const listAllVolumenes = async (req, res) => {
    try {
        const volumenes = await Volumen.findAll({
            include: [{ model: Revista, as: 'revista' }],
            order: [['revista_id', 'ASC'], ['numero_volumen', 'ASC']]
        });
        res.json(volumenes);
    } catch (error) {
        res.status(500).json({ message: 'Error al listar volúmenes', error: error.message });
    }
};
