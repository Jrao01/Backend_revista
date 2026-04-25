import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import db from "./config/conexion.js";
import "./models/index.js";

// Importar rutas
import usersRoutes from "./routes/usersRoutes.js";
import articuloRoutes from "./routes/articuloRoutes.js";
import areasRoutes from "./routes/areasRoutes.js";
import programasRoutes from "./routes/programasRoutes.js";
import lineasRoutes from "./routes/lineasRoutes.js";
import revistaRoutes from "./routes/revistaRoutes.js";

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

// Crear carpeta uploads si no existe
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('Carpeta "uploads" creada correctamente');
}

// Servir la carpeta uploads como estática
app.use('/uploads', express.static('uploads'));

// Rutas de la API
app.use('/api/usuarios', usersRoutes);
app.use('/api/articulos', articuloRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/programas', programasRoutes);
app.use('/api/lineas', lineasRoutes);
app.use('/api/revistas', revistaRoutes);

// Función de arranque del servidor
const startServer = async () => {
    try {
        console.log('Conectando a la base de datos');
        await db.authenticate();

        console.log('Sincronizando modelos');
        await db.sync({
            force: false
        });

        const server = app.listen(port, () => {
            console.log(`SERVIDOR ACTIVO EN PUERTO: ${port}`);
            console.log(`URL: http://localhost:${port}`);
        });

        // Manejo de errores del servidor
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`El puerto ${port} ya está en uso.`);
            } else {
                console.error('Error en el servidor:', error);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error('Fallo crítico al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();