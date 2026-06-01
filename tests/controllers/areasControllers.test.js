import { jest } from '@jest/globals';

const mockArea = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
};

const mockPrograma = {
    findByPk: jest.fn()
};

const mockLineaInvestigacion = {};

jest.unstable_mockModule('../../models/index.js', () => ({
    Area: mockArea,
    Programa: mockPrograma,
    LineaInvestigacion: mockLineaInvestigacion
}));

const {
    createArea,
    listAreas,
    getAreaById,
    updateArea,
    deleteArea
} = await import('../../controllers/areasControllers.js');

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('areasControllers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('listAreas debe listar áreas correctamente', async () => {
        const req = {};
        const res = mockResponse();

        const areasMock = [
            {
                id: 1,
                programa_id: 1,
                nombre: 'Ciencias de la Salud',
                color_institucional: '#0057B8'
            }
        ];

        mockArea.findAll.mockResolvedValue(areasMock);

        await listAreas(req, res);

        expect(mockArea.findAll).toHaveBeenCalledWith({
            include: [
                {
                    model: mockPrograma,
                    as: 'programa'
                },
                {
                    model: mockLineaInvestigacion,
                    as: 'lineas'
                }
            ],
            order: [['id', 'ASC']]
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            message: 'Áreas listadas correctamente',
            data: areasMock
        });
    });

    test('getAreaById debe devolver un área si existe', async () => {
        const req = {
            params: {
                id: 1
            }
        };

        const res = mockResponse();

        const areaMock = {
            id: 1,
            programa_id: 1,
            nombre: 'Ciencias de la Salud'
        };

        mockArea.findByPk.mockResolvedValue(areaMock);

        await getAreaById(req, res);

        expect(mockArea.findByPk).toHaveBeenCalledWith(1, {
            include: [
                {
                    model: mockPrograma,
                    as: 'programa'
                },
                {
                    model: mockLineaInvestigacion,
                    as: 'lineas'
                }
            ]
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            message: 'Área obtenida correctamente',
            data: areaMock
        });
    });

    test('getAreaById debe devolver 404 si el área no existe', async () => {
        const req = {
            params: {
                id: 999
            }
        };

        const res = mockResponse();

        mockArea.findByPk.mockResolvedValue(null);

        await getAreaById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            message: 'Área no encontrada',
            errors: null
        });
    });

    test('createArea debe crear un área correctamente si el programa existe', async () => {
        const req = {
            body: {
                programa_id: 1,
                nombre: 'Ciencias de la Salud',
                color_institucional: '#0057B8'
            }
        };

        const res = mockResponse();

        const programaMock = {
            id: 1,
            nombre: 'Medicina'
        };

        const areaCreada = {
            id: 1,
            programa_id: 1,
            nombre: 'Ciencias de la Salud',
            color_institucional: '#0057B8'
        };

        mockPrograma.findByPk.mockResolvedValue(programaMock);
        mockArea.create.mockResolvedValue(areaCreada);

        await createArea(req, res);

        expect(mockPrograma.findByPk).toHaveBeenCalledWith(1);

        expect(mockArea.create).toHaveBeenCalledWith({
            programa_id: 1,
            nombre: 'Ciencias de la Salud',
            color_institucional: '#0057B8'
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            message: 'Área creada correctamente',
            data: areaCreada
        });
    });

    test('createArea debe devolver 404 si el programa no existe', async () => {
        const req = {
            body: {
                programa_id: 999,
                nombre: 'Ciencias de la Salud',
                color_institucional: '#0057B8'
            }
        };

        const res = mockResponse();

        mockPrograma.findByPk.mockResolvedValue(null);

        await createArea(req, res);

        expect(mockArea.create).not.toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            message: 'El programa indicado no existe',
            errors: null
        });
    });

    test('updateArea debe actualizar un área existente', async () => {
        const req = {
            params: {
                id: 1
            },
            body: {
                programa_id: 1,
                nombre: 'Área Actualizada',
                color_institucional: '#FFFFFF'
            }
        };

        const res = mockResponse();

        const areaMock = {
            id: 1,
            programa_id: 1,
            nombre: 'Ciencias de la Salud',
            update: jest.fn().mockResolvedValue(true)
        };

        const programaMock = {
            id: 1,
            nombre: 'Medicina'
        };

        mockArea.findByPk.mockResolvedValue(areaMock);
        mockPrograma.findByPk.mockResolvedValue(programaMock);

        await updateArea(req, res);

        expect(areaMock.update).toHaveBeenCalledWith({
            programa_id: 1,
            nombre: 'Área Actualizada',
            color_institucional: '#FFFFFF'
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            message: 'Área actualizada correctamente',
            data: areaMock
        });
    });

    test('updateArea debe devolver 404 si el área no existe', async () => {
        const req = {
            params: {
                id: 999
            },
            body: {
                nombre: 'Área Actualizada'
            }
        };

        const res = mockResponse();

        mockArea.findByPk.mockResolvedValue(null);

        await updateArea(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            message: 'Área no encontrada',
            errors: null
        });
    });

    test('deleteArea debe eliminar un área existente', async () => {
        const req = {
            params: {
                id: 1
            }
        };

        const res = mockResponse();

        const areaMock = {
            id: 1,
            nombre: 'Ciencias de la Salud',
            destroy: jest.fn().mockResolvedValue(true)
        };

        mockArea.findByPk.mockResolvedValue(areaMock);

        await deleteArea(req, res);

        expect(areaMock.destroy).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            message: 'Área eliminada correctamente',
            data: null
        });
    });

    test('deleteArea debe devolver 404 si el área no existe', async () => {
        const req = {
            params: {
                id: 999
            }
        };

        const res = mockResponse();

        mockArea.findByPk.mockResolvedValue(null);

        await deleteArea(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            message: 'Área no encontrada',
            errors: null
        });
    });
});