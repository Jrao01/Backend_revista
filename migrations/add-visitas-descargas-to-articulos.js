export async function up(queryInterface, Sequelize, helpers = {}) {
    const hasTable = helpers.tableExists
        ? await helpers.tableExists('articulos')
        : true;
    if (!hasTable) return;

    const table = await queryInterface.describeTable('articulos');

    if (!table.views) {
        await queryInterface.addColumn('articulos', 'views', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        });
    }

    if (!table.downloads) {
        await queryInterface.addColumn('articulos', 'downloads', {
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

    if (table.views) {
        await queryInterface.removeColumn('articulos', 'views');
    }

    if (table.downloads) {
        await queryInterface.removeColumn('articulos', 'downloads');
    }
}
