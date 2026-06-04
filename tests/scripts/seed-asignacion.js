/**
 * Seed completo para probar asignación Dixon.
 * Crea: usuario, programa, área, línea, revista, número (volumen 12), artículo.
 *
 * Uso (servidor puede estar arriba o abajo):
 *   npm run seed:asignacion
 */
import bcrypt from 'bcrypt';
import db from '../../config/conexion.js';
import '../../models/index.js';
import {
    Usuario,
    Programa,
    Area,
    LineaInvestigacion,
    Revista,
    NumeroRevista,
    Articulo
} from '../../models/index.js';

const SEED = {
    correo: 'dixon.seed@test.com',
    password: 'password123',
    volumen: 12,
    issn: 'SEED-DIXON-0001',
    tituloArticulo: 'Artículo seed Dixon - asignación'
};

async function seedAsignacion() {
    console.log('--- Seed asignación Dixon (completo) ---\n');

    await db.authenticate();

    const passwordHash = await bcrypt.hash(SEED.password, 10);

    const [editor, editorNuevo] = await Usuario.findOrCreate({
        where: { correo: SEED.correo },
        defaults: {
            nombre: 'Dixon',
            apellido: 'Seed',
            password: passwordHash,
            rol: 'editor',
            oncti: '0000-0000-0000-0001',
            afiliacion_institucional: 'UNERG'
        }
    });
    if (!editorNuevo && editor.password !== passwordHash) {
        editor.password = passwordHash;
        await editor.save();
    }

    const [programa] = await Programa.findOrCreate({
        where: { nombre: 'Programa Seed Dixon' },
        defaults: { nombre: 'Programa Seed Dixon' }
    });

    const [area] = await Area.findOrCreate({
        where: { nombre: 'Área Seed Dixon', programa_id: programa.id },
        defaults: {
            programa_id: programa.id,
            nombre: 'Área Seed Dixon',
            color_institucional: '#0057B8'
        }
    });

    const [linea] = await LineaInvestigacion.findOrCreate({
        where: { nombre: 'Línea Seed Dixon', area_id: area.id },
        defaults: {
            area_id: area.id,
            nombre: 'Línea Seed Dixon',
            tipo: 'Matriz'
        }
    });

    const [revista] = await Revista.findOrCreate({
        where: { issn: SEED.issn },
        defaults: {
            nombre: 'Revista Seed Dixon',
            issn: SEED.issn,
            periodicidad: 'semestral',
            descripcion: 'Datos de prueba para asignación'
        }
    });

    let numero = await NumeroRevista.findOne({
        where: {
            revista_id: revista.id,
            volumen: SEED.volumen,
            numero: 1
        }
    });
    if (!numero) {
        numero = await NumeroRevista.create({
            revista_id: revista.id,
            volumen: SEED.volumen,
            numero: 1,
            anio: 2026,
            titulo_edicion: 'Enero-Junio (seed)',
            status: 'futuro'
        });
        console.log('  [creado] número de revista');
    } else {
        console.log('  [ya existía] número de revista');
    }

    let articulo = await Articulo.findOne({
        where: {
            titulo_es: SEED.tituloArticulo,
            revista_id: revista.id
        }
    });
    if (!articulo) {
        articulo = await Articulo.create({
            revista_id: revista.id,
            programa_id: programa.id,
            linea_id: linea.id,
            autor_principal_id: editor.id,
            titulo_es: SEED.tituloArticulo,
            titulo_en: 'Dixon seed article',
            resumen_es: 'Resumen de prueba',
            palabras_clave: 'seed, dixon, prueba',
            firma_originalidad: true,
            firma_etica: true,
            status: 'aprobado',
            numero_revista_id: null
        });
        console.log('  [creado] artículo');
    } else {
        articulo.status = 'aprobado';
        articulo.numero_revista_id = null;
        await articulo.save();
        console.log('  [ya existía] artículo (reset a aprobado, sin número)');
    }

    console.log('\n========== DATOS LISTOS ==========\n');
    console.log('Login:');
    console.log(`  correo: ${SEED.correo}`);
    console.log(`  password: ${SEED.password}\n`);
    console.log('IDs para Thunder Client:');
    console.log(`  revId (revista)     : ${revista.id}`);
    console.log(`  volId en URL        : ${SEED.volumen}  ← campo "volumen", NO es tabla aparte hoy`);
    console.log(`  numId en URL        : ${numero.id}     ← id de la fila, NO el campo "numero"`);
    console.log(`  articulo_id (body)  : ${articulo.id}\n`);
    console.log('Crear número (si lo haces manual):');
    console.log(`  POST /api/revistas/${revista.id}/numeros\n`);
    console.log('Tu endpoint asignar:');
    console.log(
        `  POST /api/revistas/${revista.id}/volumenes/${SEED.volumen}/numeros/${numero.id}/articulos`
    );
    console.log(`  Body: { "articulo_id": ${articulo.id} }\n`);
    console.log('Ver artículo después:');
    console.log(`  GET /api/articulos/${articulo.id}\n`);
}

seedAsignacion()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Error en seed:', err.message);
        if (err.parent) console.error(err.parent.message);
        process.exit(1);
    });
