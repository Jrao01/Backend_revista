import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
    getArticleById,
    updateArticle,
    getArticulos,
    getArticulosAprobados
} from '../../controllers/articuloControllers.js';
import { Articulo, Usuario, AutorSecundario } from '../../models/index.js';

describe('Edición y Consulta de Artículos', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            query: {}
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

    describe('getArticleById', () => {
        test('debe incluir autor_principal y coautores', async () => {
            req.params.id = '123';
            jest.spyOn(Articulo, 'findByPk').mockResolvedValue({ id: 123 });

            await getArticleById(req, res);

            expect(Articulo.findByPk).toHaveBeenCalledWith(
                '123',
                expect.objectContaining({
                    include: expect.arrayContaining([
                        expect.objectContaining({
                            model: Usuario,
                            as: 'autor_principal'
                        }),
                        expect.objectContaining({
                            model: AutorSecundario,
                            include: expect.arrayContaining([
                                expect.objectContaining({ model: Usuario })
                            ])
                        })
                    ])
                })
            );
        });
    });

    describe('getArticulos', () => {
        test('debe incluir autor_principal y coautores', async () => {
            jest.spyOn(Articulo, 'findAll').mockResolvedValue([]);

            await getArticulos(req, res);

            expect(Articulo.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.arrayContaining([
                        expect.objectContaining({
                            model: Usuario,
                            as: 'autor_principal'
                        }),
                        expect.objectContaining({
                            model: AutorSecundario,
                            include: expect.arrayContaining([
                                expect.objectContaining({ model: Usuario })
                            ])
                        })
                    ])
                })
            );
        });
    });

    describe('getArticulosAprobados', () => {
        test('debe incluir autor_principal y coautores', async () => {
            jest.spyOn(Articulo, 'findAll').mockResolvedValue([]);

            await getArticulosAprobados(req, res);

            expect(Articulo.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.arrayContaining([
                        expect.objectContaining({
                            model: Usuario,
                            as: 'autor_principal'
                        }),
                        expect.objectContaining({
                            model: AutorSecundario,
                            include: expect.arrayContaining([
                                expect.objectContaining({ model: Usuario })
                            ])
                        })
                    ])
                })
            );
        });
    });

    describe('updateArticle', () => {
        test('debe retornar 400 si el artículo no tiene el estado por_corregir', async () => {
            req.params.id = '123';
            req.body = { titulo_es: 'Nuevo Título' };
            const mockArticulo = {
                id: 123,
                status: 'enviado',
                save: jest.fn()
            };
            jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);

            await updateArticle(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining("por_corregir")
            }));
            expect(mockArticulo.save).not.toHaveBeenCalled();
        });

        test('debe actualizar los campos si el estado es por_corregir', async () => {
            req.params.id = '123';
            req.body = {
                titulo_es: 'Nuevo Título',
                titulo_en: 'New Title',
                palabras_clave: 'palabra1, palabra2',
                linea_id: 5,
                img: 'path/to/img.png'
            };
            const mockArticulo = {
                id: 123,
                status: 'por_corregir',
                titulo_es: 'Título Viejo',
                titulo_en: 'Old Title',
                palabras_clave: 'vieja1',
                linea_id: 1,
                img: 'old/img.png',
                save: jest.fn().mockResolvedValue(true)
            };
            jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);

            await updateArticle(req, res);

            expect(mockArticulo.titulo_es).toBe('Nuevo Título');
            expect(mockArticulo.titulo_en).toBe('New Title');
            expect(mockArticulo.palabras_clave).toBe('palabra1, palabra2');
            expect(mockArticulo.linea_id).toBe(5);
            expect(mockArticulo.img).toBe('path/to/img.png');
            expect(mockArticulo.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Artículo actualizado exitosamente"
            }));
        });

        test('debe actualizar la imagen desde req.file si existe', async () => {
            req.params.id = '123';
            req.body = {};
            req.file = { path: 'uploads/img-new.png' };
            
            const mockArticulo = {
                id: 123,
                status: 'por_corregir',
                img: 'old/img.png',
                save: jest.fn().mockResolvedValue(true)
            };
            jest.spyOn(Articulo, 'findByPk').mockResolvedValue(mockArticulo);

            await updateArticle(req, res);

            expect(mockArticulo.img).toBe('uploads/img-new.png');
            expect(mockArticulo.save).toHaveBeenCalled();
        });
    });
});
