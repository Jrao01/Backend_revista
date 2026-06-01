import { validationResult } from 'express-validator';

const validarCampos = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }

  next();
};

export default validarCampos;