import { jest } from '@jest/globals';

const mockPrograma = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
};

const mockArea = {
    findByPk: jest.fn()
};

const mockLineaInvestigacion = {};

jest.unstable_mockModule('../../models/index.js', () => ({
    Programa: mockPrograma,
    Area: mockArea,
    LineaInvestigacion: mockLineaInvestigacion
}));

const {
    getProgramas,
    getProgramaById,
    crearPrograma,
    actualizarPrograma,
    eliminarPrograma
} = await import('../../controllers/programasControllers.js');

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('programasControllers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getProgramas debe listar programas correctamente', async () => {
        const req = {};
        const res = mockResponse();

        const programasMock = [
            { id: 1, area_id: 1, nombre: 'Medicina' }
        ];

        mockPrograma.findAll.mockResolvedValue(programasMock);

        await getProgramas(req, res);

        expect(mockPrograma.findAll).toHaveBeenCalledWith({
            include: [
                { model: mockArea, as: 'area' },
                { model: mockLineaInvestigacion, as: 'lineas' }
            ],
            order: [['id', 'ASC']]
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getProgramaById debe devolver 404 si no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();

        mockPrograma.findByPk.mockResolvedValue(null);

        await getProgramaById(req, res);

        expect(mockPrograma.findByPk).toHaveBeenCalledWith(999, {
            include: [
                { model: mockArea, as: 'area' },
                { model: mockLineaInvestigacion, as: 'lineas' }
            ]
        });

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('crearPrograma debe crear un programa correctamente', async () => {
        const req = {
            body: { area_id: 1, nombre: 'Medicina' }
        };
        const res = mockResponse();

        const areaMock = { id: 1, nombre: 'Ciencias de la Salud' };
        const programaCreado = { id: 1, area_id: 1, nombre: 'Medicina' };

        mockArea.findByPk.mockResolvedValue(areaMock);
        mockPrograma.create.mockResolvedValue(programaCreado);

        await crearPrograma(req, res);

        expect(mockArea.findByPk).toHaveBeenCalledWith(1);
        expect(mockPrograma.create).toHaveBeenCalledWith({ area_id: 1, nombre: 'Medicina' });
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('crearPrograma debe devolver 404 si el área no existe', async () => {
        const req = {
            body: { area_id: 999, nombre: 'Medicina' }
        };
        const res = mockResponse();

        mockArea.findByPk.mockResolvedValue(null);

        await crearPrograma(req, res);

        expect(mockPrograma.create).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('actualizarPrograma debe actualizar un programa existente', async () => {
        const req = {
            params: { id: 1 },
            body: { area_id: 1, nombre: 'Medicina Integral' }
        };
        const res = mockResponse();

        const areaMock = { id: 1, nombre: 'Ciencias de la Salud' };
        const programaMock = {
            id: 1, area_id: 1, nombre: 'Medicina',
            update: jest.fn().mockResolvedValue(true)
        };

        mockPrograma.findByPk.mockResolvedValue(programaMock);
        mockArea.findByPk.mockResolvedValue(areaMock);

        await actualizarPrograma(req, res);

        expect(programaMock.update).toHaveBeenCalledWith({ area_id: 1, nombre: 'Medicina Integral' });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('actualizarPrograma debe devolver 404 si no existe', async () => {
        const req = { params: { id: 999 }, body: { nombre: 'X' } };
        const res = mockResponse();

        mockPrograma.findByPk.mockResolvedValue(null);

        await actualizarPrograma(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('eliminarPrograma debe eliminar un programa existente', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();

        const programaMock = {
            id: 1, nombre: 'Medicina',
            lineas: [],
            destroy: jest.fn().mockResolvedValue(true)
        };

        mockPrograma.findByPk.mockResolvedValue(programaMock);

        await eliminarPrograma(req, res);

        expect(programaMock.destroy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('eliminarPrograma debe devolver 404 si no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();

        mockPrograma.findByPk.mockResolvedValue(null);

        await eliminarPrograma(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('eliminarPrograma debe devolver 400 si tiene líneas asociadas', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();

        const programaMock = {
            id: 1, nombre: 'Medicina',
            lineas: [{ id: 1, nombre: 'Línea 1' }]
        };

        mockPrograma.findByPk.mockResolvedValue(programaMock);

        await eliminarPrograma(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});
