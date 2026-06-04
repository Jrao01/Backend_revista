import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
    asignarArticuloANumero,
    getArticleById
} from '../../controllers/articuloControllers.js';
import { Articulo, NumeroRevista } from '../../models/index.js';

describe('Asignación de artículos a números (Dixon)', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { revId: '1', volId: '12', numId: '5' },
            body: { articulo_id: 10 }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('asignarArticuloANumero: vincula artículo y cambia status a asignado', async () => {
        jest.spyOn(NumeroRevista, 'findOne').mockResolvedValue({
            id: 5,
            revista_id: 1,
            volumen: 12
        });

        const mockArticulo = {
            id: 10,
            revista_id: 1,
            numero_revista_id: null,
            status: 'aprobado',
            save: jest.fn().mockResolvedValue(true)
        };
        jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);

        await asignarArticuloANumero(req, res);

        expect(mockArticulo.numero_revista_id).toBe(5);
        expect(mockArticulo.status).toBe('asignado');
        expect(mockArticulo.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('asignarArticuloANumero: responde 404 si el número no existe', async () => {
        jest.spyOn(NumeroRevista, 'findOne').mockResolvedValue(null);

        await asignarArticuloANumero(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('asignarArticuloANumero: responde 400 si el artículo es de otra revista', async () => {
        jest.spyOn(NumeroRevista, 'findOne').mockResolvedValue({
            id: 5,
            revista_id: 1,
            volumen: 12
        });
        jest.spyOn(Articulo, 'findByPk').mockResolvedValue({
            id: 10,
            revista_id: 2,
            save: jest.fn()
        });

        await asignarArticuloANumero(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getArticleById: incluye el número de revista asignado', async () => {
        req = { params: { id: '10' } };

        const mockArticulo = {
            id: 10,
            titulo_es: 'Estudio de prueba',
            numero_revista: {
                id: 5,
                volumen: 12,
                numero: 1,
                anio: 2026
            }
        };
        jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);

        await getArticleById(req, res);

        expect(Articulo.findByPk).toHaveBeenCalledWith(
            '10',
            expect.objectContaining({
                include: expect.arrayContaining([
                    expect.objectContaining({ as: 'numero_revista' })
                ])
            })
        );
        expect(res.json).toHaveBeenCalledWith(mockArticulo);
    });
});
