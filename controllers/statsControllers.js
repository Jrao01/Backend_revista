import { Op, fn, col, literal } from 'sequelize';
import { Articulo, Usuario, Evaluacion, LineaInvestigacion, Revista } from "../models/index.js";

export const getDashboardStats = async (req, res) => {
    try {
        const totalArticulos = await Articulo.count();
        const totalUsuarios = await Usuario.count();
        const totalEvaluaciones = await Evaluacion.count();

        const usuariosPorRol = await Usuario.findAll({
            attributes: ['rol', [fn('COUNT', col('usuarios.id')), 'cantidad']],
            group: ['rol']
        });

        const articulosPorStatus = await Articulo.findAll({
            attributes: ['status', [fn('COUNT', col('articulos.id')), 'cantidad']],
            group: ['status']
        });

        const articulosPorLinea = await Articulo.findAll({
            attributes: ['linea_id', [fn('COUNT', col('articulos.id')), 'cantidad']],
            include: [{
                model: LineaInvestigacion,
                attributes: ['nombre']
            }],
            group: ['linea_id', 'lineas_investigacion.id', 'lineas_investigacion.nombre']
        });

        const monthlyData = await Articulo.findAll({
            attributes: [
                [fn('strftime', '%Y-%m', col('fecha_recepcion')), 'mes'],
                [fn('COUNT', col('articulos.id')), 'submissions'],
                [literal(`SUM(CASE WHEN status = 'publicado' THEN 1 ELSE 0 END)`), 'published']
            ],
            where: {
                fecha_recepcion: { [Op.not]: null }
            },
            group: [fn('strftime', '%Y-%m', col('fecha_recepcion'))],
            order: [[fn('strftime', '%Y-%m', col('fecha_recepcion')), 'ASC']],
            raw: true
        });

        res.json({
            totals: {
                articulos: totalArticulos,
                usuarios: totalUsuarios,
                evaluaciones: totalEvaluaciones
            },
            usuariosPorRol: usuariosPorRol.map(u => ({ rol: u.rol, cantidad: parseInt(u.getDataValue('cantidad'), 10) })),
            articulosPorStatus: articulosPorStatus.map(a => ({ status: a.status, cantidad: parseInt(a.getDataValue('cantidad'), 10) })),
            articulosPorLinea: articulosPorLinea.map(a => ({
                linea_id: a.linea_id,
                linea_nombre: a.LineaInvestigacion?.nombre || 'Sin clasificar',
                cantidad: parseInt(a.getDataValue('cantidad'), 10)
            })),
            monthlyData: monthlyData.map(m => ({
                mes: m.mes,
                submissions: parseInt(m.submissions, 10),
                published: parseInt(m.published, 10)
            }))
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener estadísticas", error: error.message });
    }
};
