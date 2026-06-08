import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Sequelize, DataTypes } from 'sequelize';
import db from './conexion.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '../migrations');

/** Orden fijo: cada archivo se ejecuta una sola vez y queda registrado. */
const MIGRATION_FILES = [
    'create-programas.js',
    'create-areas.js',
    'create-lineas-investigracion.js',
    'create-volumenes.js',
    'update-numeros-revista-volumen-id.js',
    'add-numero-revista-id-to-articulos.js',
    'swap-area-programa-linea-fks.js',
    'drop-tipo-from-lineas.js',
    'add-status-to-hierarchy.js',
    'add-portada-to-revistas.js',
    'drop-programa-id-from-articulos.js'
];

const Meta = db.define(
    'sequelize_meta',
    { name: { type: DataTypes.STRING, primaryKey: true } },
    { tableName: 'sequelize_meta', timestamps: false }
);

async function tableExists(queryInterface, tableName) {
    const tables = await queryInterface.showAllTables();
    const normalized = tables.map((t) =>
        typeof t === 'string' ? t.toLowerCase() : String(t).toLowerCase()
    );
    return normalized.includes(tableName.toLowerCase());
}

async function indexExists(queryInterface, tableName, indexName) {
    const indexes = await queryInterface.showIndex(tableName);
    return indexes.some((idx) => idx.name === indexName);
}

export async function runPendingMigrations() {
    const queryInterface = db.getQueryInterface();
    await Meta.sync();

    const done = new Set(
        (await Meta.findAll({ attributes: ['name'] })).map((r) => r.name)
    );

    for (const file of MIGRATION_FILES) {
        if (done.has(file)) continue;

        const fullPath = path.join(migrationsDir, file);
        if (!fs.existsSync(fullPath)) {
            console.warn(`Migración no encontrada (omitida): ${file}`);
            continue;
        }

        const mod = await import(pathToFileURL(fullPath).href);
        if (typeof mod.up !== 'function') {
            throw new Error(`Migración ${file} no exporta up()`);
        }

        console.log(`Migración: ${file}`);
        await mod.up(queryInterface, Sequelize, {
            tableExists: (name) => tableExists(queryInterface, name),
            indexExists: (table, idx) => indexExists(queryInterface, table, idx)
        });

        await Meta.create({ name: file });
    }
}
