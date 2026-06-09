import db from '../config/conexion.js';
import '../models/index.js';

async function addStatsColumns() {
  try {
    console.log('Agregando columnas de estadísticas...');

    await db.query(`
      ALTER TABLE articulos ADD COLUMN views INTEGER DEFAULT 0;
    `);
    console.log('✓ Columna views agregada a articulos');

    await db.query(`
      ALTER TABLE numeros_revista ADD COLUMN views INTEGER DEFAULT 0;
    `);
    console.log('✓ Columna views agregada a numeros_revista');

    await db.query(`
      ALTER TABLE numeros_revista ADD COLUMN downloads INTEGER DEFAULT 0;
    `);
    console.log('✓ Columna downloads agregada a numeros_revista');

    console.log('Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('duplicate column')) {
      console.log('Las columnas ya existen, migración omitida');
      process.exit(0);
    }
    console.error('Error en migración:', error);
    process.exit(1);
  }
}

addStatsColumns();
