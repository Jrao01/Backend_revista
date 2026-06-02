import { jest } from '@jest/globals';

const mockLineaInvestigacion = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
};

const mockArea = {
    findByPk: jest.fn()
};

jest.unstable_mockModule('../../models/index.js', () => ({
    LineaInvestigacion: mockLineaInvestigacion,
    Area: mockArea
}));

const {
    createLinea,
    listLineas,
    getLineaById,
    updateLinea,
    deleteLinea
} = await import('../../controllers/lineaInvestigacionController.js');

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('lineaInvestigacionController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('listLineas debe listar líneas correctamente', async () => {
        const req = {};
        const res = mockResponse();

        const lineasMock = [
            {
                id: 1,
                area_id: 1,
                nombre: 'Salud pública y epidemiología',
                tipo: 'Matriz'
            }
        ];

        mockLineaInvestigacion.findAll.mockResolvedValue(lineasMock);

        await listLineas(req, res);

        expect(mockLineaInvestigacion.findAll).toHaveBeenCalledWith({
            include: [
                {
                    model: mockArea,
                    as: 'area'
                }
            ],
            order: [['id', 'ASC']]
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            message: 'Líneas de investigación listadas correctamente',
            data: lineasMock
        });
    });

    test('getLineaById debe devolver una línea si existe', async () => {
        const req = {
            params: {
                id: 1
            }
        };

        const res = mockResponse();

        const lineaMock = {
            id: 1,
            area_id: 1,
            nombre: 'Salud pública y epidemiología',
            tipo: 'Matriz'
        };

        mockLineaInvestigacion.findByPk.mockResolvedValue(lineaMock);

        await getLineaById(req, res);

        expect(mockLineaInvestigacion.findByPk).toHaveBeenCalledWith(1, {
            include: [
                {
                    model: mockArea,
                    as: 'area'
                }
            ]
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            message: 'Línea de investigación obtenida correctamente',
            data: lineaMock
        });
    });

    test('getLineaById debe devolver 404 si no existe', async () => {
        const req = {
            params: {
                id: 999
            }
        };

        const res = mockResponse();

        mockLineaInvestigacion.findByPk.mockResolvedValue(null);

        await getLineaById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            message: 'Línea de investigación no encontrada',
            errors: null
        });
    });

    test('createLinea debe crear una línea correctamente si el área existe', async () => {
        const req = {
            body: {
                area_id: 1,
                nombre: 'Salud pública y epidemiología',
                tipo: 'Matriz'
            }
        };

        const res = mockResponse();

        const areaMock = {
            id: 1,
            nombre: 'Ciencias de la Salud'
        };

        const lineaCreada = {
            id: 1,
            area_id: 1,
            nombre: 'Salud pública y epidemiología',
            tipo: 'Matriz'
        };

        mockArea.findByPk.mockResolvedValue(areaMock);
        mockLineaInvestigacion.create.mockResolvedValue(lineaCreada);

        await createLinea(req, res);

        expect(mockArea.findByPk).toHaveBeenCalledWith(1);

        expect(mockLineaInvestigacion.create).toHaveBeenCalledWith({
            area_id: 1,
            nombre: 'Salud pública y epidemiología',
            tipo: 'Matriz'
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            message: 'Línea de investigación creada correctamente',
            data: lineaCreada
        });
    });

    test('createLinea debe devolver 404 si el área no existe', async () => {
        const req = {
            body: {
                area_id: 999,
                nombre: 'Salud pública y epidemiología',
                tipo: 'Matriz'
            }
        };

        const res = mockResponse();

        mockArea.findByPk.mockResolvedValue(null);

        await createLinea(req, res);

        expect(mockLineaInvestigacion.create).not.toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            message: 'El área indicada no existe',
            errors: null
        });
    });

    test('updateLinea debe actualizar una línea existente', async () => {
        const req = {
            params: {
                id: 1
            },
            body: {
                area_id: 1,
                nombre: 'Línea Actualizada',
                tipo: 'Asociada'
            }
        };

        const res = mockResponse();

        const lineaMock = {
            id: 1,
            area_id: 1,
            nombre: 'Salud pública y epidemiología',
            tipo: 'Matriz',
            update: jest.fn().mockResolvedValue(true)
        };

        const areaMock = {
            id: 1,
            nombre: 'Ciencias de la Salud'
        };

        mockLineaInvestigacion.findByPk.mockResolvedValue(lineaMock);
        mockArea.findByPk.mockResolvedValue(areaMock);

        await updateLinea(req, res);

        expect(lineaMock.update).toHaveBeenCalledWith({
            area_id: 1,
            nombre: 'Línea Actualizada',
            tipo: 'Asociada'
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            message: 'Línea de investigación actualizada correctamente',
            data: lineaMock
        });
    });

    test('updateLinea debe devolver 404 si la línea no existe', async () => {
        const req = {
            params: {
                id: 999
            },
            body: {
                nombre: 'Línea Actualizada'
            }
        };

        const res = mockResponse();

        mockLineaInvestigacion.findByPk.mockResolvedValue(null);

        await updateLinea(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            message: 'Línea de investigación no encontrada',
            errors: null
        });
    });

    test('deleteLinea debe eliminar una línea existente', async () => {
        const req = {
            params: {
                id: 1
            }
        };

        const res = mockResponse();

        const lineaMock = {
            id: 1,
            nombre: 'Salud pública y epidemiología',
            tipo: 'Matriz',
            destroy: jest.fn().mockResolvedValue(true)
        };

        mockLineaInvestigacion.findByPk.mockResolvedValue(lineaMock);

        await deleteLinea(req, res);

        expect(lineaMock.destroy).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            message: 'Línea de investigación eliminada correctamente',
            data: null
        });
    });

    test('deleteLinea debe devolver 404 si la línea no existe', async () => {
        const req = {
            params: {
                id: 999
            }
        };

        const res = mockResponse();

        mockLineaInvestigacion.findByPk.mockResolvedValue(null);

        await deleteLinea(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            message: 'Línea de investigación no encontrada',
            errors: null
        });
    });
});