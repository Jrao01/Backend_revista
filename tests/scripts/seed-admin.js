/**
 * Seed usuario admin.
 * Uso: npm run seed:admin
 */
import bcrypt from 'bcrypt';
import db from '../../config/conexion.js';
import '../../models/index.js';
import { Usuario } from '../../models/index.js';

const ADMIN_CREDENCIALES = {
  nombre: 'admin',
  apellido: 'admin',
  correo: 'admin@gmail.com',
  password: 'admin123',
  afiliacion_institucional: 'UNERG',
  rol: 'admin'
};

async function seedAdmin() {
  console.log('--- Seed usuario admin ---\n');
  await db.authenticate();

  const passwordHash = await bcrypt.hash(ADMIN_CREDENCIALES.password, 10);

  const [usuario, creado] = await Usuario.findOrCreate({
    where: { correo: ADMIN_CREDENCIALES.correo },
    defaults: {
      nombre: ADMIN_CREDENCIALES.nombre,
      apellido: ADMIN_CREDENCIALES.apellido,
      password: passwordHash,
      afiliacion_institucional: ADMIN_CREDENCIALES.afiliacion_institucional,
      rol: ADMIN_CREDENCIALES.rol
    }
  });

  if (creado) {
    console.log('Usuario admin creado:', usuario.correo);
  } else {
    console.log('Usuario admin ya existía:', usuario.correo);
  }

  console.log('\nCredenciales:');
  console.log(`  email: ${ADMIN_CREDENCIALES.correo}`);
  console.log(`  password: ${ADMIN_CREDENCIALES.password}\n`);
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error en seed admin:', err.message);
    if (err.parent) console.error(err.parent.message);
    process.exit(1);
  });
