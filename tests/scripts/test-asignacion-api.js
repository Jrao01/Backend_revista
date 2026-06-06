/**
 * Prueba E2E asignación Dixon (API en :3000 + seed).
 */
import axios from 'axios';

const API = 'http://localhost:3000/api';
const LOGIN = {
    correo: 'dixon.seed@test.com',
    password: 'password123'
};

async function run() {
    console.log('--- Test API asignación Dixon ---\n');

    const login = await axios.post(`${API}/usuarios/login`, LOGIN);
    const token = login.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    const revistas = await axios.get(`${API}/revistas`);
    const revista = revistas.data.find((r) => r.issn === 'SEED-DIXON-0001');
    if (!revista) throw new Error('Ejecuta: npm run seed:asignacion');

    const volumenes = await axios.get(`${API}/revistas/${revista.id}/volumenes`);
    const volumen = volumenes.data.find((v) => v.numero_volumen === 12);
    if (!volumen) throw new Error('No hay volumen 12. Ejecuta el seed.');

    const numeros = await axios.get(
        `${API}/revistas/${revista.id}/volumenes/${volumen.id}/numeros`
    );
    const numero = numeros.data[0];
    if (!numero) throw new Error('No hay números en el volumen. Ejecuta el seed.');

    const articulos = await axios.get(`${API}/articulos`, { headers });
    const articulo = articulos.data.find(
        (a) => a.titulo_es === 'Artículo seed Dixon - asignación'
    );
    if (!articulo) throw new Error('No hay artículo seed.');

    const asignar = await axios.post(
        `${API}/revistas/${revista.id}/volumenes/${volumen.id}/numeros/${numero.id}/articulos`,
        { articulo_id: articulo.id },
        { headers }
    );

    console.log('POST asignar →', asignar.status, asignar.data.message);
    if (asignar.data.articulo?.status !== 'asignado') {
        throw new Error('Se esperaba status asignado');
    }

    const detalle = await axios.get(`${API}/articulos/${articulo.id}`, { headers });
    if (!detalle.data.numero_revista?.volumen) {
        throw new Error('GET debe incluir numero_revista.volumen');
    }

    console.log('GET → numero_revista.volumen.numero_volumen:', detalle.data.numero_revista.volumen.numero_volumen);
    console.log('\n--- OK ---\n');
}

run().catch((err) => {
    console.error('\nFALLÓ:', err.response?.data || err.message);
    process.exit(1);
});
