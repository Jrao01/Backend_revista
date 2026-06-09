import { jest } from '@jest/globals';

const mockArea = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
};

const mockPrograma = {
    findByPk: jest.fn(),
    findAll: jest.fn()
};

const mockLineaInvestigacion = {
    update: jest.fn()
};

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
            { id: 1, nombre: 'Ciencias de la Salud', color_institucional: '#0057B8' }
        ];

        mockArea.findAll.mockResolvedValue(areasMock);

        await listAreas(req, res);

        expect(mockArea.findAll).toHaveBeenCalledWith({
            include: [{ model: mockPrograma, as: 'programas' }],
            order: [['id', 'ASC']]
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getAreaById debe devolver un área si existe', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();

        const areaMock = { id: 1, nombre: 'Ciencias de la Salud' };
        mockArea.findByPk.mockResolvedValue(areaMock);

        await getAreaById(req, res);

        expect(mockArea.findByPk).toHaveBeenCalledWith(1, {
            include: [{ model: mockPrograma, as: 'programas' }]
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getAreaById debe devolver 404 si el área no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();

        mockArea.findByPk.mockResolvedValue(null);

        await getAreaById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('createArea debe crear un área correctamente', async () => {
        const req = {
            body: { nombre: 'Ciencias de la Salud', color_institucional: '#0057B8' }
        };
        const res = mockResponse();

        const areaCreada = { id: 1, nombre: 'Ciencias de la Salud', color_institucional: '#0057B8' };
        mockArea.create.mockResolvedValue(areaCreada);

        await createArea(req, res);

        expect(mockArea.create).toHaveBeenCalledWith({
            nombre: 'Ciencias de la Salud',
            color_institucional: '#0057B8'
        });

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('updateArea debe actualizar un área existente', async () => {
        const req = {
            params: { id: 1 },
            body: { nombre: 'Área Actualizada', color_institucional: '#FFFFFF' }
        };
        const res = mockResponse();

        const areaMock = {
            id: 1, nombre: 'Ciencias de la Salud',
            update: jest.fn().mockResolvedValue(true)
        };
        mockArea.findByPk.mockResolvedValue(areaMock);

        await updateArea(req, res);

        expect(areaMock.update).toHaveBeenCalledWith({
            nombre: 'Área Actualizada',
            color_institucional: '#FFFFFF'
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateArea debe devolver 404 si el área no existe', async () => {
        const req = { params: { id: 999 }, body: { nombre: 'X' } };
        const res = mockResponse();

        mockArea.findByPk.mockResolvedValue(null);

        await updateArea(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('deleteArea debe eliminar un área existente', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();

        const areaMock = {
            id: 1, nombre: 'Ciencias de la Salud',
            programas: [],
            destroy: jest.fn().mockResolvedValue(true)
        };
        mockArea.findByPk.mockResolvedValue(areaMock);

        await deleteArea(req, res);

        expect(areaMock.destroy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('deleteArea debe devolver 404 si el área no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();

        mockArea.findByPk.mockResolvedValue(null);

        await deleteArea(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('deleteArea debe devolver 400 si tiene programas asociados', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();

        const areaMock = {
            id: 1, nombre: 'Ciencias de la Salud',
            programas: [{ id: 1, nombre: 'Programa 1' }]
        };
        mockArea.findByPk.mockResolvedValue(areaMock);

        await deleteArea(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});
