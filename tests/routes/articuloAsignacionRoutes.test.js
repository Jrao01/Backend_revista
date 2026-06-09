import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const mockAsignarArticuloANumero = jest.fn((req, res) => {
    res.status(200).json({
        message: 'Artículo asignado al número correctamente',
        articulo: {
            id: req.body.articulo_id,
            numero_revista_id: Number(req.params.numId),
            status: 'asignado'
        }
    });
});

const mockGetArticleById = jest.fn((req, res) => {
    res.status(200).json({
        id: Number(req.params.id),
        status: 'asignado',
        numero_revista: {
            id: 5,
            volumen: 12,
            numero: 1
        }
    });
});

const mockCheckAuth = (req, res, next) => {
    req.usuario = { id: 1, rol: 'editor' };
    next();
};

jest.unstable_mockModule('../../controllers/articuloControllers.js', () => ({
    asignarArticuloANumero: mockAsignarArticuloANumero,
    postArticle: jest.fn(),
    postArchive: jest.fn(),
    getArticleById: mockGetArticleById,
    updateArticle: jest.fn(),
    getArticulos: jest.fn(),
    getArticulosAprobados: jest.fn(),
    getArticulosPublicados: jest.fn(),
    assignArticle: jest.fn(),
    getRelatedArticles: jest.fn(),
    getArticleBySlug: jest.fn(),
    getMyManuscripts: jest.fn(),
    getMyArticleEvaluations: jest.fn(),
    rechazarArticulo: jest.fn(),
    reUploadFiles: jest.fn(),
    getArticleAdminDetail: jest.fn()
}));

jest.unstable_mockModule('../../middlewares/authMiddleware.js', () => ({
    default: mockCheckAuth
}));

const revistaRoutes = (await import('../../routes/revistaRoutes.js')).default;
const articuloRoutes = (await import('../../routes/articuloRoutes.js')).default;

const app = express();
app.use(express.json());
app.use('/api/revistas', revistaRoutes);
app.use('/api/articulos', articuloRoutes);

describe('Rutas de asignación de artículos (Dixon)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /api/revistas/:revId/volumenes/:volId/numeros/:numId/articulos asigna artículo', async () => {
        const response = await request(app)
            .post('/api/revistas/1/volumenes/12/numeros/5/articulos')
            .send({ articulo_id: 10 });

        expect(response.status).toBe(200);
        expect(response.body.articulo.status).toBe('asignado');
        expect(response.body.articulo.numero_revista_id).toBe(5);
        expect(mockAsignarArticuloANumero).toHaveBeenCalled();
    });

    test('POST asignación falla si articulo_id no es numérico', async () => {
        const response = await request(app)
            .post('/api/revistas/1/volumenes/12/numeros/5/articulos')
            .send({ articulo_id: 'abc' });

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(mockAsignarArticuloANumero).not.toHaveBeenCalled();
    });

    test('GET /api/articulos/:id devuelve artículo con número asignado', async () => {
        const response = await request(app).get('/api/articulos/10');

        expect(response.status).toBe(200);
        expect(response.body.numero_revista).toBeDefined();
        expect(response.body.numero_revista.id).toBe(5);
        expect(mockGetArticleById).toHaveBeenCalled();
    });
});
