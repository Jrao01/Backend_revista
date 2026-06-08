import db from '../config/conexion.js';

(async () => {
  try {
    const queryInterface = db.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('usuarios');

    if (!tableInfo.cedula) {
      await queryInterface.addColumn('usuarios', 'cedula', {
        type: db.Sequelize.STRING,
        allowNull: true,
        unique: true,
      });
      console.log('Columna "cedula" agregada a la tabla usuarios.');
    } else {
      console.log('La columna "cedula" ya existe en usuarios.');
      // Ensure unique index exists
      const indexes = await queryInterface.showIndex('usuarios');
      const hasUniqueCedula = indexes.some(idx => idx.unique && idx.fields.includes('cedula'));
      if (!hasUniqueCedula) {
        await queryInterface.addIndex('usuarios', ['cedula'], { unique: true });
        console.log('Índice único agregado a "cedula".');
      } else {
        console.log('El índice único en "cedula" ya existe.');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error en migración de cedula:', error);
    process.exit(1);
  }
})();
