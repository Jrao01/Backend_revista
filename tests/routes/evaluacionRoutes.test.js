import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const mockGetEvaluaciones = jest.fn((req, res) => {
  res.json([
    { id: 1, articulo_id: 1, revisor_id: 10, veredicto: 'aprobado' },
    { id: 2, articulo_id: 1, revisor_id: 20, veredicto: null }
  ]);
});

const mockGetEvaluacionById = jest.fn((req, res) => {
  const id = Number(req.params.id);
  if (id === 999) return res.status(404).json({ message: 'Evaluación no encontrada' });
  res.json({ id, articulo_id: 1, revisor_id: 10, veredicto: 'aprobado' });
});

const mockGetEvaluacionesByArticulo = jest.fn((req, res) => {
  res.json([{ id: 1, articulo_id: Number(req.params.id), revisor_id: 10 }]);
});

const mockEnviarVeredicto = jest.fn((req, res) => {
  if (!req.body.veredicto || !['aprobado', 'corregir', 'rechazado'].includes(req.body.veredicto)) {
    return res.status(400).json({ ok: false, message: 'El veredicto debe ser: aprobado, corregir o rechazado' });
  }
  res.json({ message: 'Veredicto registrado correctamente', evaluacion: { id: Number(req.params.id), veredicto: req.body.veredicto } });
});

const mockEliminarEvaluacion = jest.fn((req, res) => {
  const id = Number(req.params.id);
  if (id === 999) return res.status(404).json({ message: 'Evaluación no encontrada' });
  res.json({ message: 'Evaluación eliminada correctamente' });
});

jest.unstable_mockModule('../../controllers/evaluacionControllers.js', () => ({
  getEvaluaciones: mockGetEvaluaciones,
  getEvaluacionById: mockGetEvaluacionById,
  getEvaluacionesByArticulo: mockGetEvaluacionesByArticulo,
  enviarVeredicto: mockEnviarVeredicto,
  eliminarEvaluacion: mockEliminarEvaluacion
}));

jest.unstable_mockModule('../../middlewares/authMiddleware.js', () => ({
  default: (req, res, next) => {
    req.usuario = { id: 1, rol: 'revisor' };
    next();
  }
}));

jest.unstable_mockModule('../../middlewares/rolMiddleware.js', () => ({
  checkRol: () => (req, res, next) => next()
}));

jest.unstable_mockModule('../../middlewares/validarCampos.js', () => ({
  default: (req, res, next) => next()
}));

const evaluacionRoutes = (await import('../../routes/evaluacionRoutes.js')).default;

const app = express();
app.use(express.json());
app.use('/api/evaluaciones', evaluacionRoutes);

describe('Rutas de Evaluaciones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/evaluaciones retorna lista de evaluaciones', async () => {
    const res = await request(app).get('/api/evaluaciones');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockGetEvaluaciones).toHaveBeenCalled();
  });

  test('GET /api/evaluaciones/:id retorna una evaluación', async () => {
    const res = await request(app).get('/api/evaluaciones/1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(mockGetEvaluacionById).toHaveBeenCalled();
  });

  test('GET /api/evaluaciones/:id retorna 404 si no existe', async () => {
    const res = await request(app).get('/api/evaluaciones/999');

    expect(res.status).toBe(404);
  });

  test('GET /api/evaluaciones/articulo/:id retorna evaluaciones del artículo', async () => {
    const res = await request(app).get('/api/evaluaciones/articulo/5');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockGetEvaluacionesByArticulo).toHaveBeenCalled();
  });

  test('PUT /api/evaluaciones/:id/veredicto envía veredicto', async () => {
    const res = await request(app)
      .put('/api/evaluaciones/1/veredicto')
      .send({ veredicto: 'aprobado', observaciones_autor: 'Buen trabajo' });

    expect(res.status).toBe(200);
    expect(res.body.evaluacion.veredicto).toBe('aprobado');
    expect(mockEnviarVeredicto).toHaveBeenCalled();
  });

  test('PUT /api/evaluaciones/:id/veredicto falla con veredicto inválido', async () => {
    const res = await request(app)
      .put('/api/evaluaciones/1/veredicto')
      .send({ veredicto: 'invalido' });

    expect(res.status).toBe(400);
  });

  test('DELETE /api/evaluaciones/:id elimina evaluación', async () => {
    const res = await request(app).delete('/api/evaluaciones/1');

    expect(res.status).toBe(200);
    expect(mockEliminarEvaluacion).toHaveBeenCalled();
  });

  test('DELETE /api/evaluaciones/:id retorna 404 si no existe', async () => {
    const res = await request(app).delete('/api/evaluaciones/999');

    expect(res.status).toBe(404);
  });
});
