export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('lineas_investigacion', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      area_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'areas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  }
  
  export async function down(queryInterface) {
    await queryInterface.dropTable('lineas_investigacion');
  }