import express, {
    urlencoded
} from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import db from "./config/conexion.js";
import "./models/index.js";

// Importar rutas
import usersRoutes from "./routes/usersRoutes.js";
import articuloRoutes from "./routes/articuloRoutes.js";
import areasRoutes from "./routes/areasRoutes.js";
import programasRoutes from "./routes/programasRoutes.js";
import lineasRoutes from "./routes/lineasRoutes.js";
import revistaRoutes from "./routes/revistaRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

//Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(urlencoded({
    extended: true
}));

// Servir la carpeta uploads como estática para poder acceder a los archivos desde el navegador
app.use('/uploads', express.static('uploads'));

// Rutas de la API
app.use('/api/usuarios', usersRoutes);
app.use('/api/articulos', articuloRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/programas', programasRoutes);
app.use('/api/lineas', lineasRoutes);
app.use('/api/revistas', revistaRoutes);

db.sync({ force: false })
    .then(() => {
        app.listen(port, () => {
            console.log(`Servidor corriendo en el puerto ${port}`);
        });
    })
    .catch(err => console.log("Error al sincronizar la base de datos:", err));