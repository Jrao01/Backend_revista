import { NumeroRevista } from "../models/index.js";

export const crearNumero = async (req, res) => {
    try {
        const { revistaId } = req.params;
        const { volumen, numero, anio, titulo_edicion, status, fecha_publicacion } = req.body;

        const nuevoNumero = await NumeroRevista.create({
            revista_id: parseInt(revistaId),
            volumen,
            numero,
            anio,
            titulo_edicion,
            status: status || 'futuro',
            fecha_publicacion
        });

        res.status(201).json({ message: "Volumen/Número de revista creado exitosamente", numero: nuevoNumero });
    } catch (error) {
        res.status(500).json({ message: "Error al crear número de revista", error: error.message });
    }
};

export const getNumerosPorRevista = async (req, res) => {
    try {
        const { revistaId } = req.params;
        const numeros = await NumeroRevista.findAll({
            where: { revista_id: parseInt(revistaId) }
        });
        res.json(numeros);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener números de la revista", error: error.message });
    }
};
