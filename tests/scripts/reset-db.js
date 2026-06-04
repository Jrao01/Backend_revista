/**
 * Borra config/database.sqlite (emergencia: DB corrupta por sync alter).
 * Uso: npm run db:reset
 * Cierra Docker, DB Browser y la vista SQLite en Cursor antes de ejecutar.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbPath = path.join(__dirname, '../../config/database.sqlite');

try {
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log('Eliminado:', dbPath);
    } else {
        console.log('No había DB en:', dbPath);
    }
} catch (err) {
    if (err.code === 'EBUSY' || err.code === 'EPERM') {
        console.error('\nCierra lo que tenga abierto el archivo:');
        console.error('  docker compose down');
        console.error('  npm run dev / node index.js');
        console.error('  DB Browser o extensión SQLite en Cursor\n');
        console.error('Archivo:', dbPath);
        process.exit(1);
    }
    throw err;
}

console.log('\nSiguiente: docker compose up -d   o   npm start');
console.log('Luego: npm run seed:asignacion');
