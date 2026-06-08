export async function up(queryInterface, Sequelize, helpers = {}) {
    const hasTable = helpers.tableExists
        ? await helpers.tableExists('revistas')
        : true;
    if (!hasTable) return;

    const table = await queryInterface.describeTable('revistas');

    if (!table.portada) {
        await queryInterface.addColumn('revistas', 'portada', {
            type: Sequelize.STRING,
            allowNull: true
        });
    }
}

export async function down(queryInterface) {
    const table = await queryInterface.describeTable('revistas');

    if (table.portada) {
        await queryInterface.removeColumn('revistas', 'portada');
    }
}
