import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api';

async function test() {
    try {
        console.log('--- Iniciando pruebas de flujo completo ---');

        // 1. Registro de usuario
        console.log('\n1. Registrando usuario...');
        const userRes = await axios.post(`${API_URL}/usuarios/registro`, {
            nombre: 'Juan',
            apellido: 'Perez',
            correo: `juan${Date.now()}@test.com`,
            password: 'password123',
            orcid: '0000-0001-2345-6789',
            afiliacion_institucional: 'UNERG',
            rol: 'autor'
        });
        console.log('Respuesta registro:', userRes.data.message);
        const email = JSON.parse(userRes.config.data).correo;

        // 2. Login
        console.log('\n2. Iniciando sesión...');
        const loginRes = await axios.post(`${API_URL}/usuarios/login`, {
            correo: email,
            password: 'password123'
        });
        const token = loginRes.data.token;
        const userId = loginRes.data.usuario.id;
        console.log('Login exitoso. Token obtenido.');

        const headers = { Authorization: `Bearer ${token}` };

        // 3. Crear Area, Programa y Linea
        console.log('\n3. Creando estructura académica...');
        const areaRes = await axios.post(`${API_URL}/areas`, { nombre: 'Salud', color_institucional: '#ff0000' }, { headers });
        const areaId = areaRes.data.area.id;

        const progRes = await axios.post(`${API_URL}/programas`, { nombre: 'Medicina', area_id: areaId }, { headers });
        const progId = progRes.data.programa.id;

        const lineaRes = await axios.post(`${API_URL}/lineas`, { nombre: 'Epidemiología', area_id: areaId, tipo: 'Matriz' }, { headers });
        const lineaId = lineaRes.data.linea.id;
        console.log('Estructura académica creada.');

        // 3.5 Crear Revista
        console.log('\n3.5 Creando revista...');
        const revistaRes = await axios.post(`${API_URL}/revistas`, { 
            nombre: 'Revista de Salud UNERG', 
            issn: '1234-5678', 
            periodicidad: 'Semestral' 
        }, { headers });
        const revistaId = revistaRes.data.revista.id;
        console.log('Revista creada.');

        // 4. Registrar Artículo con Archivos
        console.log('\n4. Registrando artículo con 5 archivos...');
        const form = new FormData();
        form.append('revista_id', revistaId);
        form.append('programa_id', progId);
        form.append('linea_id', lineaId);
        form.append('titulo_es', 'Estudio sobre el COVID-19');
        form.append('titulo_en', 'COVID-19 Study');
        form.append('resumen_es', 'Resumen en español...');
        form.append('resumen_en', 'English summary...');
        form.append('palabras_clave', 'salud, virus, estudio');
        form.append('es_anonimo', 'false');

        const archivos = [
            { field: 'manuscrito_original', file: 'manuscrito.docx' },
            { field: 'pagina_titulo', file: 'pagina_titulo.pdf' },
            { field: 'carta_originalidad', file: 'carta_originalidad.pdf' },
            { field: 'ficha_autores', file: 'ficha_autores.pdf' },
            { field: 'material_suplementario', file: 'material_suplementario.pdf' }
        ];

        archivos.forEach(a => {
            const filePath = path.join(process.cwd(), 'tests', 'archivos', a.file);
            form.append(a.field, fs.createReadStream(filePath));
        });

        const articleRes = await axios.post(`${API_URL}/articulos/registrar`, form, {
            headers: {
                ...headers,
                ...form.getHeaders()
            }
        });
        const articleId = articleRes.data.articulo.id;
        console.log('Artículo registrado con ID:', articleId);

        // 5. Consultar Artículo
        console.log('\n5. Consultando detalle del artículo...');
        const detailRes = await axios.get(`${API_URL}/articulos/${articleId}`, { headers });
        console.log('Título:', detailRes.data.titulo_es);
        console.log('Archivos adjuntos:', detailRes.data.archivos_articulos.length);

        // 6. Consultar Perfil con Artículos
        console.log('\n6. Consultando perfil del usuario...');
        const profileRes = await axios.get(`${API_URL}/usuarios/${userId}`, { headers });
        console.log('Nombre:', profileRes.data.nombre);
        console.log('Artículos del usuario:', profileRes.data.articulos_principales.length);

        console.log('\n--- Pruebas finalizadas con éxito ---');

    } catch (error) {
        console.error('\nError en las pruebas:');
        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

test();
