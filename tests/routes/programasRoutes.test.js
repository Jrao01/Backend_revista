import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const mockGetProgramas = jest.fn((req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Programas obtenidos exitosamente',
        data: []
    });
});

const mockGetProgramaById = jest.fn((req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Programa obtenido exitosamente',
        data: {
            id: Number(req.params.id),
            nombre: 'Medicina'
        }
    });
});

const mockCrearPrograma = jest.fn((req, res) => {
    res.status(201).json({
        ok: true,
        message: 'Programa creado exitosamente',
        data: req.body
    });
});

const mockActualizarPrograma = jest.fn((req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Programa actualizado exitosamente',
        data: {
            id: Number(req.params.id),
            ...req.body
        }
    });
});

const mockEliminarPrograma = jest.fn((req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Programa eliminado exitosamente',
        data: null
    });
});

jest.unstable_mockModule('../../controllers/programasControllers.js', () => ({
    getProgramas: mockGetProgramas,
    getProgramaById: mockGetProgramaById,
    crearPrograma: mockCrearPrograma,
    actualizarPrograma: mockActualizarPrograma,
    eliminarPrograma: mockEliminarPrograma
}));

jest.unstable_mockModule('../../middlewares/authMiddleware.js', () => ({
    default: (req, res, next) => next()
}));

const programasRoutes = (await import('../../routes/programasRoutes.js')).default;

const app = express();
app.use(express.json());
app.use('/api/programas', programasRoutes);

describe('programasRoutes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/programas debe responder 200', async () => {
        const response = await request(app).get('/api/programas');

        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(mockGetProgramas).toHaveBeenCalled();
    });

    test('GET /api/programas/:id debe responder 200 con ID válido', async () => {
        const response = await request(app).get('/api/programas/1');

        expect(response.status).toBe(200);
        expect(response.body.data.id).toBe(1);
        expect(mockGetProgramaById).toHaveBeenCalled();
    });

    test('GET /api/programas/:id debe fallar si el ID no es numérico', async () => {
        const response = await request(app).get('/api/programas/abc');

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(mockGetProgramaById).not.toHaveBeenCalled();
    });

    test('POST /api/programas debe crear programa con datos válidos', async () => {
        const response = await request(app)
            .post('/api/programas')
            .send({
                nombre: 'Medicina'
            });

        expect(response.status).toBe(201);
        expect(response.body.ok).toBe(true);
        expect(mockCrearPrograma).toHaveBeenCalled();
    });

    test('POST /api/programas debe fallar si nombre está vacío', async () => {
        const response = await request(app)
            .post('/api/programas')
            .send({
                nombre: ''
            });

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(mockCrearPrograma).not.toHaveBeenCalled();
    });

    test('PUT /api/programas/:id debe actualizar programa con datos válidos', async () => {
        const response = await request(app)
            .put('/api/programas/1')
            .send({
                nombre: 'Medicina Integral'
            });

        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(mockActualizarPrograma).toHaveBeenCalled();
    });

    test('PUT /api/programas/:id debe fallar si ID no es numérico', async () => {
        const response = await request(app)
            .put('/api/programas/abc')
            .send({
                nombre: 'Medicina Integral'
            });

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(mockActualizarPrograma).not.toHaveBeenCalled();
    });

    test('DELETE /api/programas/:id debe eliminar programa con ID válido', async () => {
        const response = await request(app).delete('/api/programas/1');

        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(mockEliminarPrograma).toHaveBeenCalled();
    });

    test('DELETE /api/programas/:id debe fallar si ID no es numérico', async () => {
        const response = await request(app).delete('/api/programas/abc');

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(mockEliminarPrograma).not.toHaveBeenCalled();
    });
});