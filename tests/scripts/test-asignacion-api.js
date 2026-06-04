/**
 * Prueba E2E de la asignación Dixon (requiere API en :3000 y seed ejecutado).
 *
 *   node tests/scripts/seed-asignacion.js
 *   docker compose up -d   (o npm run dev)
 *   node tests/scripts/test-asignacion-api.js
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
    if (!revista) {
        throw new Error('No hay revista seed. Ejecuta: node tests/scripts/seed-asignacion.js');
    }

    const numeros = await axios.get(`${API}/revistas/${revista.id}/numeros`);
    const numero = numeros.data.find((n) => n.volumen === 12);
    if (!numero) {
        throw new Error('No hay número con volumen 12. Ejecuta el seed.');
    }

    const articulos = await axios.get(`${API}/articulos`, { headers });
    const articulo = articulos.data.find(
        (a) => a.titulo_es === 'Artículo seed Dixon - asignación'
    );
    if (!articulo) {
        throw new Error('No hay artículo seed. Ejecuta el seed.');
    }

    console.log('IDs:', { revId: revista.id, numId: numero.id, artId: articulo.id });

    const asignar = await axios.post(
        `${API}/revistas/${revista.id}/volumenes/12/numeros/${numero.id}/articulos`,
        { articulo_id: articulo.id },
        { headers }
    );

    console.log('\nPOST asignar →', asignar.status, asignar.data.message);
    if (asignar.data.articulo?.status !== 'asignado') {
        throw new Error('Se esperaba status "asignado"');
    }
    if (asignar.data.articulo?.numero_revista_id !== numero.id) {
        throw new Error('numero_revista_id no coincide');
    }

    const detalle = await axios.get(`${API}/articulos/${articulo.id}`, { headers });

    console.log('GET artículo → status:', detalle.data.status);
    if (!detalle.data.numero_revista) {
        throw new Error('GET no incluye numero_revista');
    }
    console.log('numero_revista:', detalle.data.numero_revista);

    console.log('\n--- OK: asignación Dixon funciona ---\n');
}

run().catch((err) => {
    console.error('\nFALLÓ:', err.response?.data || err.message);
    console.error('\nAsegúrate: seed ejecutado + servidor en http://localhost:3000\n');
    process.exit(1);
});
