import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const mockListAreas = jest.fn((req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Áreas listadas correctamente',
        data: []
    });
});

const mockGetAreaById = jest.fn((req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Área obtenida correctamente',
        data: {
            id: Number(req.params.id),
            programa_id: 1,
            nombre: 'Ciencias de la Salud'
        }
    });
});

const mockCreateArea = jest.fn((req, res) => {
    res.status(201).json({
        ok: true,
        message: 'Área creada correctamente',
        data: req.body
    });
});

const mockUpdateArea = jest.fn((req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Área actualizada correctamente',
        data: {
            id: Number(req.params.id),
            ...req.body
        }
    });
});

const mockDeleteArea = jest.fn((req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Área eliminada correctamente',
        data: null
    });
});

jest.unstable_mockModule('../../controllers/areasControllers.js', () => ({
    listAreas: mockListAreas,
    getAreaById: mockGetAreaById,
    createArea: mockCreateArea,
    updateArea: mockUpdateArea,
    deleteArea: mockDeleteArea
}));

const areasRoutes = (await import('../../routes/areasRoutes.js')).default;

const app = express();
app.use(express.json());
app.use('/api/areas', areasRoutes);

describe('areasRoutes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/areas debe responder 200', async () => {
        const response = await request(app).get('/api/areas');

        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(mockListAreas).toHaveBeenCalled();
    });

    test('GET /api/areas/:id debe responder 200 con ID válido', async () => {
        const response = await request(app).get('/api/areas/1');

        expect(response.status).toBe(200);
        expect(response.body.data.id).toBe(1);
        expect(mockGetAreaById).toHaveBeenCalled();
    });

    test('GET /api/areas/:id debe fallar si ID no es numérico', async () => {
        const response = await request(app).get('/api/areas/abc');

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(mockGetAreaById).not.toHaveBeenCalled();
    });

    test('POST /api/areas debe crear área con datos válidos', async () => {
        const response = await request(app)
            .post('/api/areas')
            .send({
                nombre: 'Ciencias de la Salud',
                color_institucional: '#0057B8'
            });

        expect(response.status).toBe(201);
        expect(response.body.ok).toBe(true);
        expect(mockCreateArea).toHaveBeenCalled();
    });

    test('POST /api/areas debe fallar si nombre está vacío', async () => {
        const response = await request(app)
            .post('/api/areas')
            .send({
                nombre: '',
                color_institucional: '#0057B8'
            });

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(mockCreateArea).not.toHaveBeenCalled();
    });

    test('PUT /api/areas/:id debe actualizar área con datos válidos', async () => {
        const response = await request(app)
            .put('/api/areas/1')
            .send({
                programa_id: 1,
                nombre: 'Área Actualizada',
                color_institucional: '#FFFFFF'
            });

        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(mockUpdateArea).toHaveBeenCalled();
    });

    test('PUT /api/areas/:id debe fallar si ID no es numérico', async () => {
        const response = await request(app)
            .put('/api/areas/abc')
            .send({
                nombre: 'Área Actualizada'
            });

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(mockUpdateArea).not.toHaveBeenCalled();
    });

    test('DELETE /api/areas/:id debe eliminar área con ID válido', async () => {
        const response = await request(app).delete('/api/areas/1');

        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(mockDeleteArea).toHaveBeenCalled();
    });

    test('DELETE /api/areas/:id debe fallar si ID no es numérico', async () => {
        const response = await request(app).delete('/api/areas/abc');

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(mockDeleteArea).not.toHaveBeenCalled();
    });
});