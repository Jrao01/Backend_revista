export async function up(queryInterface, Sequelize, helpers = {}) {
    const hasTable = helpers.tableExists
        ? await helpers.tableExists('articulos')
        : true;
    if (!hasTable) return;

    const table = await queryInterface.describeTable('articulos');

    if (!table.visitas) {
        await queryInterface.addColumn('articulos', 'visitas', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        });
    }

    if (!table.descargas) {
        await queryInterface.addColumn('articulos', 'descargas', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        });
    }
}

export async function down(queryInterface, Sequelize, helpers = {}) {
    const hasTable = helpers.tableExists
        ? await helpers.tableExists('articulos')
        : true;
    if (!hasTable) return;

    const table = await queryInterface.describeTable('articulos');

    if (table.visitas) {
        await queryInterface.removeColumn('articulos', 'visitas');
    }

    if (table.descargas) {
        await queryInterface.removeColumn('articulos', 'descargas');
    }
}
