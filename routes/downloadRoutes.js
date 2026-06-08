import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { ArchivoArticulo } from '../models/index.js';
import checkAuth from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/:archivoId', checkAuth, async (req, res) => {
    try {
        const archivo = await ArchivoArticulo.findByPk(req.params.archivoId);
        if (!archivo) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        }

        const absolutePath = path.resolve(archivo.url);
        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ message: 'El archivo no existe en el servidor' });
        }

        const ext = path.extname(archivo.originalname || archivo.url);
        const downloadName = `${archivo.tipo_archivo}-v${archivo.version}${ext}`;

        res.download(absolutePath, downloadName);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al descargar el archivo', error: error.message });
    }
});

export default router;
