import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import multer from "multer";
import db from "./config/conexion.js";
import { runPendingMigrations } from "./config/runMigrations.js";
import "./models/index.js";

// Importar rutas
import usersRoutes from "./routes/usersRoutes.js";
import articuloRoutes from "./routes/articuloRoutes.js";
import areasRoutes from "./routes/areasRoutes.js";
import programasRoutes from "./routes/programasRoutes.js";
import lineasRoutes from "./routes/lineasRoutes.js";
import revistaRoutes from "./routes/revistaRoutes.js";
import volumenesRoutes from "./routes/volumenesRoutes.js";
import editorRoutes from './routes/editorRoutes.js';
import evaluacionRoutes from './routes/evaluacionRoutes.js';
import autoresRoutes from './routes/autoresRoutes.js';
import downloadRoutes from './routes/downloadRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import statsContentRoutes from './routes/statsContentRoutes.js';
import galeradaRoutes from './routes/galeradaRoutes.js';

// Configurar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({
    extended: true
}));

// Normalizar req.body para evitar crashes en Express 5 (puede ser undefined sin Content-Type adecuado)
app.use((req, res, next) => {
    if (!req.body) req.body = {};
    next();
});

// Crear carpeta uploads si no existe
const uploadsDir = "./uploads";

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('Carpeta "uploads" creada correctamente');
}

// Servir la carpeta uploads como estática
app.use("/uploads", express.static("uploads"));

// Rutas de la API
app.use("/api/usuarios", usersRoutes);
app.use("/api/articulos", articuloRoutes);
app.use("/api/areas", areasRoutes);
app.use("/api/programas", programasRoutes);
app.use("/api/lineas", lineasRoutes);
app.use("/api/revistas", revistaRoutes);
app.use("/api/volumenes", volumenesRoutes);
app.use('/api/editor', editorRoutes);
app.use('/api/evaluaciones', evaluacionRoutes);
app.use('/api/autores', autoresRoutes);
app.use('/api/descargar', downloadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/stats-content', statsContentRoutes);
app.use('/api/galerada', galeradaRoutes);

// Error handling para JSON mal formado y Multer
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        console.error("JSON parse error:", err.message);
        return res.status(400).json({
            ok: false,
            message: "JSON inválido en el cuerpo de la solicitud",
            errors: err.message
        });
    }

    if (err instanceof multer.MulterError) {
        console.error("Multer error:", err.message);
        return res.status(400).json({
            ok: false,
            message: "Error al subir archivo: " + err.message
        });
    }

    if (err.message && err.message.includes('Formato de archivo no válido')) {
        return res.status(400).json({
            ok: false,
            message: err.message
        });
    }

    next(err);
});

// Función de arranque del servidor
const startServer = async () => {
    try {
        console.log("Conectando a la base de datos");
        await db.authenticate();

        console.log("Aplicando migraciones pendientes");
        await runPendingMigrations();

        // sync sin alter: crea tablas que faltan, no toca columnas existentes (no borra datos).
        console.log("Sincronizando modelos");
        await db.sync();

        const server = app.listen(port, () => {
            console.log(`SERVIDOR ACTIVO EN PUERTO: ${port}`);
            console.log(`URL: http://localhost:${port}`);
        });

        // Manejo de errores del servidor
        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                console.error(`El puerto ${port} ya está en uso.`);
            } else {
                console.error("Error en el servidor:", error);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error("Fallo crítico al iniciar el servidor:", error);
        process.exit(1);
    }
};

startServer();