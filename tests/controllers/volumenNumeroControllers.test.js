import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { createVolumen } from '../../controllers/volumenControllers.js';
import { createNumero } from '../../controllers/numeroRevistaController.js';
import { Volumen, Revista, NumeroRevista } from '../../models/index.js';

describe('Volúmenes y números — unicidad', () => {
    let req, res;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('createVolumen: 409 si duplica numero_volumen en la misma revista', async () => {
        req = { params: { revId: '1' }, body: { numero_volumen: 12 } };
        jest.spyOn(Revista, 'findByPk').mockResolvedValue({ id: 1 });
        jest.spyOn(Volumen, 'findOne').mockResolvedValue({ id: 2, numero_volumen: 12 });

        await createVolumen(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });

    test('createNumero: 409 si duplica numero en el mismo volumen', async () => {
        req = { params: { revId: '1', volId: '3' }, body: { numero: 1 } };
        jest.spyOn(Volumen, 'findOne').mockResolvedValue({ id: 3, revista_id: 1 });
        jest.spyOn(NumeroRevista, 'findOne').mockResolvedValue({ id: 9, numero: 1, volumen_id: 3 });

        await createNumero(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });
});
