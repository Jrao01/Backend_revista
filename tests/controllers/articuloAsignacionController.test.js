import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
    asignarArticuloANumero,
    getArticleById
} from '../../controllers/articuloControllers.js';
import { Articulo, NumeroRevista, Volumen } from '../../models/index.js';

describe('Asignación de artículos a números (Dixon)', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { revId: '1', volId: '3', numId: '5' },
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
        jest.spyOn(Volumen, 'findOne').mockResolvedValue({
            id: 3,
            revista_id: 1,
            numero_volumen: 12
        });
        jest.spyOn(NumeroRevista, 'findOne').mockResolvedValue({
            id: 5,
            revista_id: 1,
            volumen_id: 3,
            numero: 1
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
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('asignarArticuloANumero: 404 si volumen no existe', async () => {
        jest.spyOn(Volumen, 'findOne').mockResolvedValue(null);

        await asignarArticuloANumero(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('asignarArticuloANumero: 400 si artículo es de otra revista', async () => {
        jest.spyOn(Volumen, 'findOne').mockResolvedValue({ id: 3, revista_id: 1 });
        jest.spyOn(NumeroRevista, 'findOne').mockResolvedValue({ id: 5, revista_id: 1, volumen_id: 3 });
        jest.spyOn(Articulo, 'findByPk').mockResolvedValue({ id: 10, revista_id: 2, save: jest.fn() });

        await asignarArticuloANumero(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('getArticleById: incluye numero_revista con volumen', async () => {
        req = { params: { id: '10' } };
        jest.spyOn(Articulo, 'findByPk').mockResolvedValue({ id: 10 });

        await getArticleById(req, res);

        expect(Articulo.findByPk).toHaveBeenCalledWith(
            '10',
            expect.objectContaining({
                include: expect.arrayContaining([
                    expect.objectContaining({
                        as: 'numero_revista',
                        include: expect.arrayContaining([
                            expect.objectContaining({ as: 'volumen' })
                        ])
                    })
                ])
            })
        );
    });
});
