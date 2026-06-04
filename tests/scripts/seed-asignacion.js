/**
 * Seed completo: usuario, revista, volumen, número, artículo.
 * Uso: npm run seed:asignacion  (servidor arriba o abajo)
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
    Volumen,
    NumeroRevista,
    Articulo
} from '../../models/index.js';

const SEED = {
    correo: 'dixon.seed@test.com',
    password: 'password123',
    numeroVolumen: 12,
    numeroEdicion: 1,
    issn: 'SEED-DIXON-0001',
    tituloArticulo: 'Artículo seed Dixon - asignación'
};

async function seedAsignacion() {
    console.log('--- Seed asignación Dixon (volumen + número) ---\n');

    await db.authenticate();

    const passwordHash = await bcrypt.hash(SEED.password, 10);

    const [editor] = await Usuario.findOrCreate({
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

    const [volumen] = await Volumen.findOrCreate({
        where: { revista_id: revista.id, numero_volumen: SEED.numeroVolumen },
        defaults: {
            revista_id: revista.id,
            numero_volumen: SEED.numeroVolumen
        }
    });

    let numero = await NumeroRevista.findOne({
        where: { volumen_id: volumen.id, numero: SEED.numeroEdicion }
    });
    if (!numero) {
        numero = await NumeroRevista.create({
            revista_id: revista.id,
            volumen_id: volumen.id,
            numero: SEED.numeroEdicion,
            anio: 2026,
            titulo_edicion: 'Enero-Junio (seed)',
            status: 'futuro'
        });
        console.log('  [creado] número');
    } else {
        console.log('  [ya existía] número');
    }

    let articulo = await Articulo.findOne({
        where: { titulo_es: SEED.tituloArticulo, revista_id: revista.id }
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
        console.log('  [ya existía] artículo');
    }

    console.log('\n========== THUNDER CLIENT ==========\n');
    console.log(`Login: ${SEED.correo} / ${SEED.password}\n`);
    console.log('Crear volumen (409 si duplicas numero_volumen):');
    console.log(`  POST /api/revistas/${revista.id}/volumenes`);
    console.log(`  { "numero_volumen": ${SEED.numeroVolumen} }\n`);
    console.log('Crear número (409 si duplicas numero en el mismo volumen):');
    console.log(`  POST /api/revistas/${revista.id}/volumenes/${volumen.id}/numeros`);
    console.log(`  { "numero": ${SEED.numeroEdicion}, "anio": 2026, "titulo_edicion": "Enero-Junio" }\n`);
    console.log('Asignar artículo (Dixon):');
    console.log(
        `  POST /api/revistas/${revista.id}/volumenes/${volumen.id}/numeros/${numero.id}/articulos`
    );
    console.log(`  { "articulo_id": ${articulo.id} }\n`);
    console.log('Ver artículo:');
    console.log(`  GET /api/articulos/${articulo.id}\n`);
    console.log('volId en URL = id del volumen (PK), NO el 12 impreso en la portada.');
    console.log(`  Este volumen id=${volumen.id} tiene numero_volumen=${SEED.numeroVolumen}\n`);
}

seedAsignacion()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Error en seed:', err.message);
        if (err.parent) console.error(err.parent.message);
        process.exit(1);
    });
