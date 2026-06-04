export async function up(queryInterface, Sequelize, helpers = {}) {
    if (helpers.tableExists && await helpers.tableExists('areas')) return;

    await queryInterface.createTable('areas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      programa_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'programas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      color_institucional: {
        type: Sequelize.STRING
      }
    });
  }
  
  export async function down(queryInterface) {
    await queryInterface.dropTable('areas');
  }