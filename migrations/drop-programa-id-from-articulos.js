export async function up(queryInterface, Sequelize, helpers = {}) {
    const hasTable = helpers.tableExists
        ? await helpers.tableExists('articulos')
        : true;
    if (!hasTable) return;

    const table = await queryInterface.describeTable('articulos');

    if (table.programa_id) {
        await queryInterface.removeColumn('articulos', 'programa_id');
    }
}

export async function down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('articulos');

    if (!table.programa_id) {
        await queryInterface.addColumn('articulos', 'programa_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1
        });
    }
}
