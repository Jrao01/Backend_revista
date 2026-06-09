export async function up(queryInterface, Sequelize) {
  const columnExists = async (table, col) => {
    const desc = await queryInterface.describeTable(table);
    return col in desc;
  };

  if (await columnExists('lineas_investigacion', 'tipo')) {
    await queryInterface.removeColumn('lineas_investigacion', 'tipo');
  }
}

export async function down(queryInterface, Sequelize) {
  const columnExists = async (table, col) => {
    const desc = await queryInterface.describeTable(table);
    return col in desc;
  };

  if (!(await columnExists('lineas_investigacion', 'tipo'))) {
    await queryInterface.addColumn('lineas_investigacion', 'tipo', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Matriz'
    });
  }
}
