import db from '../config/conexion.js';

(async () => {
  try {
    const queryInterface = db.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('articulos');

    if (!tableInfo.pages) {
      await queryInterface.addColumn('articulos', 'pages', {
        type: db.Sequelize.STRING,
        allowNull: true,
      });
      console.log('Columna "pages" agregada a la tabla articulos.');
    } else {
      console.log('La columna "pages" ya existe en articulos.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error en migración:', error);
    process.exit(1);
  }
})();
