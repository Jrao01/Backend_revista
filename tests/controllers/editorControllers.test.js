import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { 
    realizarDeskReview,
    asignarJurados 
} from '../../controllers/editorControllers.js';
import { Articulo } from '../../models/index.js';

describe('Pruebas Unitarias del Controlador del Editor', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: 1 }, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  test('realizarDeskReview: Debería rechazar automáticamente si el plagio es >= 30%', async () => {
    req.body.porcentaje_plagio = 35;
    
    const mockArticulo = { id: 1, status: 'enviado', save: jest.fn().mockResolvedValue(true) };
    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);

    await realizarDeskReview(req, res);

    expect(mockArticulo.status).toBe('rechazado');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('realizarDeskReview: Debería aprobar el Desk Review si el plagio es < 30%', async () => {
    req.body.porcentaje_plagio = 15;
    
    const mockArticulo = { id: 1, status: 'enviado', save: jest.fn().mockResolvedValue(true) };
    jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);

    await realizarDeskReview(req, res);

    expect(mockArticulo.status).toBe('enviado');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
