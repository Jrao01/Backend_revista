export async function up(queryInterface, Sequelize) {
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