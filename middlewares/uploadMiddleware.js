import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'img') {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExts = ['.jpg', '.jpeg', '.png', '.svg', '.webp'];
        if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
            return cb(null, true);
        }
        cb(new Error('Formato de imagen no válido. Solo se permiten JPG, PNG, SVG o WebP.'));
    } else {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Formato de archivo no válido. Solo se permiten PDF o documentos de Word (doc, docx)'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024
    }
});

export default upload;
