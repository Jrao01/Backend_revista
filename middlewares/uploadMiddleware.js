import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Guarda los archivos en la carpeta uploads
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        // Nombre del archivo: nombre original del campo - timestamp - numero aleatorio + extension para nombre unicoooo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro para aceptar solo ciertos tipos de archivos
const fileFilter = (req, file, cb) => {
    const filetypes = /pdf|doc|docx|jpg|jpeg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype) || file.mimetype.startsWith('image/');

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Formato de archivo no válido. Solo se permiten PDF, documentos de Word (doc, docx) o imágenes (jpg, jpeg, png, gif, webp)'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024
    }
});

export default upload;