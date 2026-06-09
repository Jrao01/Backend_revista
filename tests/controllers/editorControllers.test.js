import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  realizarDeskReview,
  subirManuscritoAnonimo,
  asignarJurados
} from '../../controllers/editorControllers.js';
import { Articulo, ArchivoArticulo, Evaluacion, Usuario } from '../../models/index.js';

describe('Controlador del Editor — Flujo completo', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: 1 }, body: {}, file: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // --- Desk Review ---

  test('realizarDeskReview: rechaza automáticamente si plagio >= 30%', async () => {
    req.body.porcentaje_plagio = 35;
    const mockArticulo = { id: 1, status: 'enviado', save: jest.fn().mockResolvedValue(true) };
    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);

    await realizarDeskReview(req, res);

    expect(mockArticulo.status).toBe('rechazado');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('realizarDeskReview: aprueba si plagio < 30%', async () => {
    req.body.porcentaje_plagio = 15;
    const mockArticulo = { id: 1, status: 'enviado', save: jest.fn().mockResolvedValue(true) };
    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);

    await realizarDeskReview(req, res);

    expect(mockArticulo.status).toBe('enviado');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('realizarDeskReview: retorna 404 si artículo no existe', async () => {
    req.body.porcentaje_plagio = 10;
    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(null);

    await realizarDeskReview(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('realizarDeskReview: retorna 400 si falta porcentaje_plagio', async () => {
    await realizarDeskReview(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // --- Subir Manuscrito Anónimo ---

  test('subirManuscritoAnonimo: carga archivo y cambia status a en_revision', async () => {
    req.file = { path: 'uploads/test.pdf' };
    const mockArticulo = { id: 1, status: 'enviado', save: jest.fn().mockResolvedValue(true) };
    const mockArchivo = { version: 1 };

    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);
    jest.spyOn(ArchivoArticulo, 'findOne').mockResolvedValue(null);
    jest.spyOn(ArchivoArticulo, 'create').mockResolvedValue(mockArchivo);

    await subirManuscritoAnonimo(req, res);

    expect(mockArticulo.status).toBe('en_revision');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(ArchivoArticulo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        articulo_id: 1,
        tipo_archivo: 'manuscrito_anonimizado',
        es_anonimo: true
      })
    );
  });

  test('subirManuscritoAnonimo: retorna 400 si no hay archivo', async () => {
    await subirManuscritoAnonimo(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('subirManuscritoAnonimo: retorna 404 si artículo no existe', async () => {
    req.file = { path: 'uploads/test.pdf' };
    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(null);

    await subirManuscritoAnonimo(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('subirManuscritoAnonimo: incrementa versión si ya existe archivo', async () => {
    req.file = { path: 'uploads/test.pdf' };
    const mockArticulo = { id: 1, status: 'enviado', save: jest.fn().mockResolvedValue(true) };
    const mockArchivoExistente = { version: 2 };

    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);
    jest.spyOn(ArchivoArticulo, 'findOne').mockResolvedValue(mockArchivoExistente);
    jest.spyOn(ArchivoArticulo, 'create').mockResolvedValue({});

    await subirManuscritoAnonimo(req, res);

    expect(ArchivoArticulo.create).toHaveBeenCalledWith(
      expect.objectContaining({ version: 3 })
    );
  });

  // --- Asignar Jurados (corregido: revisor en vez de jurado) ---

  test('asignarJurados: asigna revisores y cambia status a En_evaluacion', async () => {
    req.body.juradosIds = [10, 20];
    const mockArticulo = {
      id: 1, status: 'en_revision',
      save: jest.fn().mockResolvedValue(true)
    };
    const mockArchivoAnonimo = { id: 1 };
    const mockRevisor1 = { id: 10, rol: 'revisor' };
    const mockRevisor2 = { id: 20, rol: 'revisor' };

    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);
    jest.spyOn(ArchivoArticulo, 'findOne').mockResolvedValue(mockArchivoAnonimo);
    jest.spyOn(Usuario, 'findByPk')
      .mockResolvedValueOnce(mockRevisor1)
      .mockResolvedValueOnce(mockRevisor2);
    jest.spyOn(Evaluacion, 'bulkCreate').mockResolvedValue([]);

    await asignarJurados(req, res);

    expect(mockArticulo.status).toBe('En_evaluacion');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(Evaluacion.bulkCreate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ articulo_id: 1, revisor_id: 10 }),
        expect.objectContaining({ articulo_id: 1, revisor_id: 20 })
      ])
    );
  });

  test('asignarJurados: retorna 400 si usuario no tiene rol revisor', async () => {
    req.body.juradosIds = [10];
    const mockArticulo = { id: 1, status: 'en_revision', save: jest.fn() };
    const mockArchivoAnonimo = { id: 1 };
    const mockUsuarioNoRevisor = { id: 10, rol: 'investigador' };

    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);
    jest.spyOn(ArchivoArticulo, 'findOne').mockResolvedValue(mockArchivoAnonimo);
    jest.spyOn(Usuario, 'findByPk').mockResolvedValue(mockUsuarioNoRevisor);

    await asignarJurados(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('asignarJurados: retorna 400 si no hay manuscrito anónimo', async () => {
    req.body.juradosIds = [10];
    const mockArticulo = { id: 1, status: 'en_revision', save: jest.fn() };

    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);
    jest.spyOn(ArchivoArticulo, 'findOne').mockResolvedValue(null);

    await asignarJurados(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('asignarJurados: retorna 400 si juradosIds está vacío', async () => {
    req.body.juradosIds = [];
    await asignarJurados(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('asignarJurados: retorna 404 si artículo no existe', async () => {
    req.body.juradosIds = [10];
    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(null);

    await asignarJurados(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
