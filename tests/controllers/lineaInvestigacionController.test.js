import { jest } from '@jest/globals';

const mockLineaInvestigacion = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
};

const mockPrograma = {
    findByPk: jest.fn()
};

jest.unstable_mockModule('../../models/index.js', () => ({
    LineaInvestigacion: mockLineaInvestigacion,
    Programa: mockPrograma
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
            { id: 1, programa_id: 1, nombre: 'Salud pública y epidemiología' }
        ];

        mockLineaInvestigacion.findAll.mockResolvedValue(lineasMock);

        await listLineas(req, res);

        expect(mockLineaInvestigacion.findAll).toHaveBeenCalledWith({
            include: [{ model: mockPrograma, as: 'programa' }],
            order: [['id', 'ASC']]
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getLineaById debe devolver una línea si existe', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();

        const lineaMock = { id: 1, programa_id: 1, nombre: 'Salud pública y epidemiología' };

        mockLineaInvestigacion.findByPk.mockResolvedValue(lineaMock);

        await getLineaById(req, res);

        expect(mockLineaInvestigacion.findByPk).toHaveBeenCalledWith(1, {
            include: [{ model: mockPrograma, as: 'programa' }]
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getLineaById debe devolver 404 si no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();

        mockLineaInvestigacion.findByPk.mockResolvedValue(null);

        await getLineaById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('createLinea debe crear una línea correctamente si el programa existe', async () => {
        const req = {
            body: { programa_id: 1, nombre: 'Salud pública y epidemiología' }
        };
        const res = mockResponse();

        const programaMock = { id: 1, nombre: 'Medicina' };
        const lineaCreada = { id: 1, programa_id: 1, nombre: 'Salud pública y epidemiología' };

        mockPrograma.findByPk.mockResolvedValue(programaMock);
        mockLineaInvestigacion.create.mockResolvedValue(lineaCreada);

        await createLinea(req, res);

        expect(mockPrograma.findByPk).toHaveBeenCalledWith(1);
        expect(mockLineaInvestigacion.create).toHaveBeenCalledWith({
            programa_id: 1,
            nombre: 'Salud pública y epidemiología'
        });
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('createLinea debe devolver 404 si el programa no existe', async () => {
        const req = {
            body: { programa_id: 999, nombre: 'Salud pública y epidemiología' }
        };
        const res = mockResponse();

        mockPrograma.findByPk.mockResolvedValue(null);

        await createLinea(req, res);

        expect(mockLineaInvestigacion.create).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('updateLinea debe actualizar una línea existente', async () => {
        const req = {
            params: { id: 1 },
            body: { programa_id: 1, nombre: 'Línea Actualizada' }
        };
        const res = mockResponse();

        const programaMock = { id: 1, nombre: 'Medicina' };
        const lineaMock = {
            id: 1, programa_id: 1, nombre: 'Salud pública y epidemiología',
            update: jest.fn().mockResolvedValue(true)
        };

        mockLineaInvestigacion.findByPk.mockResolvedValue(lineaMock);
        mockPrograma.findByPk.mockResolvedValue(programaMock);

        await updateLinea(req, res);

        expect(lineaMock.update).toHaveBeenCalledWith({ programa_id: 1, nombre: 'Línea Actualizada' });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateLinea debe devolver 404 si la línea no existe', async () => {
        const req = { params: { id: 999 }, body: { nombre: 'X' } };
        const res = mockResponse();

        mockLineaInvestigacion.findByPk.mockResolvedValue(null);

        await updateLinea(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('deleteLinea debe eliminar una línea existente', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();

        const lineaMock = {
            id: 1, nombre: 'Salud pública y epidemiología',
            destroy: jest.fn().mockResolvedValue(true)
        };

        mockLineaInvestigacion.findByPk.mockResolvedValue(lineaMock);

        await deleteLinea(req, res);

        expect(lineaMock.destroy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('deleteLinea debe devolver 404 si la línea no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();

        mockLineaInvestigacion.findByPk.mockResolvedValue(null);

        await deleteLinea(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});
