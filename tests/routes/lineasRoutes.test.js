import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const mockListLineas = jest.fn((req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Líneas de investigación listadas correctamente',
        data: []
    });
});

const mockGetLineaById = jest.fn((req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Línea de investigación obtenida correctamente',
        data: {
            id: Number(req.params.id),
            programa_id: 1,
            nombre: 'Salud pública y epidemiología'
        }
    });
});

const mockCreateLinea = jest.fn((req, res) => {
    res.status(201).json({
        ok: true,
        message: 'Línea de investigación creada correctamente',
        data: req.body
    });
});

const mockUpdateLinea = jest.fn((req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Línea de investigación actualizada correctamente',
        data: {
            id: Number(req.params.id),
            ...req.body
        }
    });
});

const mockDeleteLinea = jest.fn((req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Línea de investigación eliminada correctamente',
        data: null
    });
});

jest.unstable_mockModule('../../controllers/lineaInvestigacionController.js', () => ({
    listLineas: mockListLineas,
    getLineaById: mockGetLineaById,
    createLinea: mockCreateLinea,
    updateLinea: mockUpdateLinea,
    deleteLinea: mockDeleteLinea
}));

jest.unstable_mockModule('../../middlewares/authMiddleware.js', () => ({
    default: (req, res, next) => next()
}));

const lineasRoutes = (await import('../../routes/lineasRoutes.js')).default;

const app = express();
app.use(express.json());
app.use('/api/lineas', lineasRoutes);

describe('lineasRoutes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/lineas debe responder 200', async () => {
        const response = await request(app).get('/api/lineas');

        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(mockListLineas).toHaveBeenCalled();
    });

    test('GET /api/lineas/:id debe responder 200 con ID válido', async () => {
        const response = await request(app).get('/api/lineas/1');

        expect(response.status).toBe(200);
        expect(response.body.data.id).toBe(1);
        expect(mockGetLineaById).toHaveBeenCalled();
    });

    test('GET /api/lineas/:id debe fallar si ID no es numérico', async () => {
        const response = await request(app).get('/api/lineas/abc');

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(mockGetLineaById).not.toHaveBeenCalled();
    });

    test('POST /api/lineas debe crear línea con datos válidos', async () => {
        const response = await request(app)
            .post('/api/lineas')
            .send({ programa_id: 1, nombre: 'Salud pública y epidemiología' });

        expect(response.status).toBe(201);
        expect(response.body.ok).toBe(true);
        expect(mockCreateLinea).toHaveBeenCalled();
    });

    test('POST /api/lineas debe fallar si falta programa_id', async () => {
        const response = await request(app)
            .post('/api/lineas')
            .send({ nombre: 'Salud pública y epidemiología' });

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(mockCreateLinea).not.toHaveBeenCalled();
    });

    test('POST /api/lineas debe fallar si nombre está vacío', async () => {
        const response = await request(app)
            .post('/api/lineas')
            .send({ programa_id: 1, nombre: '' });

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(mockCreateLinea).not.toHaveBeenCalled();
    });

    test('PUT /api/lineas/:id debe actualizar línea con datos válidos', async () => {
        const response = await request(app)
            .put('/api/lineas/1')
            .send({ programa_id: 1, nombre: 'Línea Actualizada' });

        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(mockUpdateLinea).toHaveBeenCalled();
    });

    test('PUT /api/lineas/:id debe fallar si ID no es numérico', async () => {
        const response = await request(app)
            .put('/api/lineas/abc')
            .send({ nombre: 'Línea Actualizada' });

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(mockUpdateLinea).not.toHaveBeenCalled();
    });

    test('DELETE /api/lineas/:id debe eliminar línea con ID válido', async () => {
        const response = await request(app).delete('/api/lineas/1');

        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(mockDeleteLinea).toHaveBeenCalled();
    });

    test('DELETE /api/lineas/:id debe fallar si ID no es numérico', async () => {
        const response = await request(app).delete('/api/lineas/abc');

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(mockDeleteLinea).not.toHaveBeenCalled();
    });
});
