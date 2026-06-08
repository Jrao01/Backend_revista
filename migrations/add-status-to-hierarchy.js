export async function up(queryInterface, Sequelize) {
  const columnExists = async (table, col) => {
    const desc = await queryInterface.describeTable(table);
    return col in desc;
  };

  if (!(await columnExists('areas', 'status'))) {
    await queryInterface.addColumn('areas', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  }

  if (!(await columnExists('programas', 'status'))) {
    await queryInterface.addColumn('programas', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  }

  if (!(await columnExists('lineas_investigacion', 'status'))) {
    await queryInterface.addColumn('lineas_investigacion', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  }
}

export async function down(queryInterface) {
  const columnExists = async (table, col) => {
    const desc = await queryInterface.describeTable(table);
    return col in desc;
  };

  if (await columnExists('areas', 'status')) {
    await queryInterface.removeColumn('areas', 'status');
  }
  if (await columnExists('programas', 'status')) {
    await queryInterface.removeColumn('programas', 'status');
  }
  if (await columnExists('lineas_investigacion', 'status')) {
    await queryInterface.removeColumn('lineas_investigacion', 'status');
  }
}
