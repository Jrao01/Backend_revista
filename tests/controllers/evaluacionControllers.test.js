import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  getEvaluaciones,
  getEvaluacionById,
  enviarVeredicto,
  getEvaluacionesByArticulo,
  eliminarEvaluacion
} from '../../controllers/evaluacionControllers.js';
import { Evaluacion, Articulo, Usuario } from '../../models/index.js';

describe('Controlador de Evaluaciones — CRUD y Consenso', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: 1 }, body: {}, query: {}, usuario: { id: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.spyOn(Evaluacion, 'max').mockResolvedValue(1);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // --- getEvaluaciones ---

  test('getEvaluaciones: retorna todas las evaluaciones', async () => {
    const mockEvaluaciones = [
      { id: 1, articulo_id: 1, revisor_id: 10, veredicto: 'aprobado' },
      { id: 2, articulo_id: 1, revisor_id: 20, veredicto: null }
    ];
    jest.spyOn(Evaluacion, 'findAll').mockResolvedValue(mockEvaluaciones);

    await getEvaluaciones(req, res);

    expect(res.json).toHaveBeenCalledWith(mockEvaluaciones);
    expect(Evaluacion.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  test('getEvaluaciones: filtra por articulo_id', async () => {
    req.query.articulo_id = '5';
    jest.spyOn(Evaluacion, 'findAll').mockResolvedValue([]);

    await getEvaluaciones(req, res);

    expect(Evaluacion.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { articulo_id: 5 } })
    );
  });

  test('getEvaluaciones: filtra por revisor_id', async () => {
    req.query.revisor_id = '10';
    jest.spyOn(Evaluacion, 'findAll').mockResolvedValue([]);

    await getEvaluaciones(req, res);

    expect(Evaluacion.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { revisor_id: 10 } })
    );
  });

  // --- getEvaluacionById ---

  test('getEvaluacionById: retorna una evaluación', async () => {
    const mockEvaluacion = { id: 1, articulo_id: 1, revisor_id: 10 };
    jest.spyOn(Evaluacion, 'findByPk').mockResolvedValue(mockEvaluacion);

    await getEvaluacionById(req, res);

    expect(res.json).toHaveBeenCalledWith(mockEvaluacion);
  });

  test('getEvaluacionById: retorna 404 si no existe', async () => {
    jest.spyOn(Evaluacion, 'findByPk').mockResolvedValue(null);

    await getEvaluacionById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // --- enviarVeredicto ---

  test('enviarVeredicto: guarda veredicto y dispara consenso', async () => {
    req.params.id = '1';
    req.usuario = { id: 10 };
    req.body = { veredicto: 'aprobado', observaciones_autor: 'Buen trabajo' };

    const mockEvaluacion = {
      id: 1, articulo_id: 5, revisor_id: 10, veredicto: null,
      save: jest.fn().mockResolvedValue(true)
    };
    const mockEvaluaciones = [
      { id: 1, veredicto: 'aprobado' },
      { id: 2, veredicto: 'aprobado' }
    ];
    const mockArticulo = {
      id: 5, status: 'En_evaluacion',
      save: jest.fn().mockResolvedValue(true)
    };

    jest.spyOn(Evaluacion, 'findByPk')
      .mockResolvedValueOnce(mockEvaluacion)
      .mockResolvedValueOnce(mockEvaluacion)
      .mockResolvedValueOnce({ id: 1, articulo_id: 5, revisor_id: 10, veredicto: 'aprobado', observaciones_autor: 'Buen trabajo', fecha_evaluacion: new Date() });
    jest.spyOn(Evaluacion, 'findAll').mockResolvedValue(mockEvaluaciones);
    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);

    await enviarVeredicto(req, res);

    expect(mockEvaluacion.veredicto).toBe('aprobado');
    expect(mockEvaluacion.observaciones_autor).toBe('Buen trabajo');
    expect(mockArticulo.status).toBe('aprobado');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Veredicto registrado correctamente' })
    );
  });

  test('enviarVeredicto: retorna 404 si evaluación no existe', async () => {
    jest.spyOn(Evaluacion, 'findByPk').mockResolvedValue(null);

    await enviarVeredicto(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('enviarVeredicto: retorna 403 si el revisor no es el asignado', async () => {
    req.usuario = { id: 99 };
    req.body = { veredicto: 'aprobado' };
    const mockEvaluacion = { id: 1, revisor_id: 10, veredicto: null };
    jest.spyOn(Evaluacion, 'findByPk').mockResolvedValue(mockEvaluacion);

    await enviarVeredicto(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('enviarVeredicto: retorna 400 si ya tiene veredicto', async () => {
    req.usuario = { id: 10 };
    req.body = { veredicto: 'aprobado' };
    const mockEvaluacion = { id: 1, revisor_id: 10, veredicto: 'rechazado' };
    jest.spyOn(Evaluacion, 'findByPk').mockResolvedValue(mockEvaluacion);

    await enviarVeredicto(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('enviarVeredicto: retorna 400 si veredicto es inválido', async () => {
    req.usuario = { id: 10 };
    req.body = { veredicto: 'invalido' };
    const mockEvaluacion = { id: 1, revisor_id: 10, veredicto: null };
    jest.spyOn(Evaluacion, 'findByPk').mockResolvedValue(mockEvaluacion);

    await enviarVeredicto(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // --- Consenso: todos rechazan ---

  test('enviarVeredicto: consenso rechazado si todos rechazan', async () => {
    req.usuario = { id: 10 };
    req.body = { veredicto: 'rechazado' };
    const mockEvaluacion = {
      id: 1, articulo_id: 5, revisor_id: 10, veredicto: null,
      save: jest.fn().mockResolvedValue(true)
    };
    const mockEvaluaciones = [
      { id: 1, veredicto: 'rechazado' },
      { id: 2, veredicto: 'rechazado' }
    ];
    const mockArticulo = { id: 5, status: 'En_evaluacion', save: jest.fn() };

    jest.spyOn(Evaluacion, 'findByPk')
      .mockResolvedValueOnce(mockEvaluacion)
      .mockResolvedValueOnce(mockEvaluacion);
    jest.spyOn(Evaluacion, 'findAll').mockResolvedValue(mockEvaluaciones);
    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);

    await enviarVeredicto(req, res);

    expect(mockArticulo.status).toBe('rechazado');
  });

  // --- Consenso: mixto → por_corregir ---

  test('enviarVeredicto: consenso por_corregir si hay mixto', async () => {
    req.usuario = { id: 10 };
    req.body = { veredicto: 'corregir' };
    const mockEvaluacion = {
      id: 1, articulo_id: 5, revisor_id: 10, veredicto: null,
      save: jest.fn().mockResolvedValue(true)
    };
    const mockEvaluaciones = [
      { id: 1, veredicto: 'corregir' },
      { id: 2, veredicto: 'aprobado' }
    ];
    const mockArticulo = { id: 5, status: 'En_evaluacion', save: jest.fn() };

    jest.spyOn(Evaluacion, 'findByPk')
      .mockResolvedValueOnce(mockEvaluacion)
      .mockResolvedValueOnce(mockEvaluacion);
    jest.spyOn(Evaluacion, 'findAll').mockResolvedValue(mockEvaluaciones);
    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);

    await enviarVeredicto(req, res);

    expect(mockArticulo.status).toBe('por_corregir');
  });

  // --- Consenso: aún falta alguien ---

  test('enviarVeredicto: no cambia status si faltan evaluaciones', async () => {
    req.usuario = { id: 10 };
    req.body = { veredicto: 'aprobado' };
    const mockEvaluacion = {
      id: 1, articulo_id: 5, revisor_id: 10, veredicto: null,
      save: jest.fn().mockResolvedValue(true)
    };
    const mockEvaluaciones = [
      { id: 1, veredicto: 'aprobado' },
      { id: 2, veredicto: null }
    ];
    const mockArticulo = { id: 5, status: 'En_evaluacion', save: jest.fn() };

    jest.spyOn(Evaluacion, 'findByPk')
      .mockResolvedValueOnce(mockEvaluacion)
      .mockResolvedValueOnce(mockEvaluacion);
    jest.spyOn(Evaluacion, 'findAll').mockResolvedValue(mockEvaluaciones);
    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);

    await enviarVeredicto(req, res);

    expect(mockArticulo.save).not.toHaveBeenCalled();
  });

  // --- getEvaluacionesByArticulo ---

  test('getEvaluacionesByArticulo: retorna evaluaciones de un artículo', async () => {
    req.params.id = '5';
    const mockArticulo = { id: 5, titulo_es: 'Test' };
    const mockEvaluaciones = [{ id: 1, articulo_id: 5 }];

    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);
    jest.spyOn(Evaluacion, 'findAll').mockResolvedValue(mockEvaluaciones);

    await getEvaluacionesByArticulo(req, res);

    expect(res.json).toHaveBeenCalledWith(mockEvaluaciones);
  });

  test('getEvaluacionesByArticulo: retorna 404 si artículo no existe', async () => {
    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(null);

    await getEvaluacionesByArticulo(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // --- eliminarEvaluacion ---

  test('eliminarEvaluacion: elimina evaluación pendiente', async () => {
    const mockEvaluacion = {
      id: 1, veredicto: null,
      destroy: jest.fn().mockResolvedValue(true)
    };
    jest.spyOn(Evaluacion, 'findByPk').mockResolvedValue(mockEvaluacion);

    await eliminarEvaluacion(req, res);

    expect(mockEvaluacion.destroy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Evaluación eliminada correctamente' });
  });

  test('eliminarEvaluacion: retorna 400 si evaluación ya fue completada', async () => {
    const mockEvaluacion = { id: 1, veredicto: 'aprobado' };
    jest.spyOn(Evaluacion, 'findByPk').mockResolvedValue(mockEvaluacion);

    await eliminarEvaluacion(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('eliminarEvaluacion: retorna 404 si no existe', async () => {
    jest.spyOn(Evaluacion, 'findByPk').mockResolvedValue(null);

    await eliminarEvaluacion(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
