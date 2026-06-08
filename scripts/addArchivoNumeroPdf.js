import db from '../config/conexion.js';

(async () => {
  try {
    const queryInterface = db.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('numeros_revista');

    if (!tableInfo.archivo_numero_pdf) {
      await queryInterface.addColumn('numeros_revista', 'archivo_numero_pdf', {
        type: db.Sequelize.STRING,
        allowNull: true,
      });
      console.log('Columna "archivo_numero_pdf" agregada a la tabla numeros_revista.');
    } else {
      console.log('La columna "archivo_numero_pdf" ya existe en numeros_revista.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error en migración:', error);
    process.exit(1);
  }
})();
