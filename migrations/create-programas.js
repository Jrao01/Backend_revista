export async function up(queryInterface, Sequelize, helpers = {}) {
    if (helpers.tableExists && await helpers.tableExists('programas')) return;

    await queryInterface.createTable('programas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  }
  
  export async function down(queryInterface) {
    await queryInterface.dropTable('programas');
  }