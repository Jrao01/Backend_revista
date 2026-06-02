import { jest } from '@jest/globals';

const mockPrograma = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
};

const mockArea = {};

jest.unstable_mockModule('../../models/index.js', () => ({
    Programa: mockPrograma,
    Area: mockArea
}));

const {
    getProgramas,
    getProgramaById,
    crearPrograma
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
            { id: 1, nombre: 'Medicina' }
        ];

        mockPrograma.findAll.mockResolvedValue(programasMock);

        await getProgramas(req, res);

        expect(mockPrograma.findAll).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            message: 'Programas obtenidos exitosamente',
            data: programasMock
        });
    });

    test('getProgramaById debe devolver 404 si no existe', async () => {
        const req = {
            params: {
                id: 999
            }
        };

        const res = mockResponse();

        mockPrograma.findByPk.mockResolvedValue(null);

        await getProgramaById(req, res);

        expect(mockPrograma.findByPk).toHaveBeenCalledWith(
            999,
            expect.any(Object)
        );

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            message: 'Programa no encontrado',
            errors: null
        });
    });

    test('crearPrograma debe crear un programa correctamente', async () => {
        const req = {
            body: {
                nombre: 'Medicina'
            }
        };

        const res = mockResponse();

        const programaCreado = {
            id: 1,
            nombre: 'Medicina'
        };

        mockPrograma.create.mockResolvedValue(programaCreado);

        await crearPrograma(req, res);

        expect(mockPrograma.create).toHaveBeenCalledWith({
            nombre: 'Medicina'
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            message: 'Programa creado exitosamente',
            data: programaCreado
        });
    });
});