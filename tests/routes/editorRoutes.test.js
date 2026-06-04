import { jest, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// 1. Mockear los middlewares ANTES de importar las rutas para interceptarlos
jest.unstable_mockModule('../../middlewares/authMiddleware.js', () => {
  return {
    default: (req, res, next) => {
      // Simulamos que el token es válido e inyectamos el usuario editor
      req.usuario = { id: 1, rol: 'editor' };
      next();
    }
  };
});

jest.unstable_mockModule('../../middlewares/rolMiddleware.js', () => {
  return {
    checkRol: () => (req, res, next) => next() // Deja pasar cualquier rol en el test
  };
});

// 2. Importamos dinámicamente las rutas después de haber mockeado sus dependencias
const editorRoutes = (await import('../../routes/editorRoutes.js')).default;

const app = express();
app.use(express.json());
app.use('/api/editor', editorRoutes);

describe('Pruebas de Integración de Rutas del Editor', () => {
  test('PUT /api/editor/:id/desk-review debería procesar la petición', async () => {
    const res = await request(app)
      .put('/api/editor/999/desk-review')
      .set('Authorization', 'Bearer token_simulado')
      .send({ porcentaje_plagio: 10 });
    
    // Al haber puenteado la seguridad, ahora sí llegará al controlador.
    // Como el artículo 999 no existe en la BD del test, el controlador responderá 404.
    expect(res.statusCode).toBe(404); 
  });
});
