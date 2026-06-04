/**
 * Ejecuta migraciones pendientes sin levantar el servidor.
 * Uso: npm run db:migrate
 */
import dotenv from 'dotenv';
import db from '../config/conexion.js';
import { runPendingMigrations } from '../config/runMigrations.js';

dotenv.config();

try {
    await db.authenticate();
    await runPendingMigrations();
    console.log('Migraciones al día.');
    process.exit(0);
} catch (err) {
    console.error('Error en migraciones:', err.message);
    if (err.parent) console.error(err.parent.message);
    process.exit(1);
}
