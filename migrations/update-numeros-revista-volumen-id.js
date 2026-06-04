export async function up(queryInterface, Sequelize, helpers = {}) {
    const hasTable = helpers.tableExists
        ? await helpers.tableExists('numeros_revista')
        : true;

    if (!hasTable) return;

    const table = await queryInterface.describeTable('numeros_revista');

    if (!table.volumen_id) {
        await queryInterface.addColumn('numeros_revista', 'volumen_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'volumenes', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });
    }

    if (table.volumen) {
        await queryInterface.removeColumn('numeros_revista', 'volumen');
    }

    const hasIndex = helpers.indexExists
        ? await helpers.indexExists('numeros_revista', 'uq_numeros_volumen_numero')
        : false;

    if (!hasIndex) {
        await queryInterface.addIndex('numeros_revista', ['volumen_id', 'numero'], {
            unique: true,
            name: 'uq_numeros_volumen_numero'
        });
    }
}

export async function down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('numeros_revista');

    if (!table.volumen) {
        await queryInterface.addColumn('numeros_revista', 'volumen', {
            type: Sequelize.INTEGER,
            allowNull: true
        });
    }

    if (table.volumen_id) {
        await queryInterface.removeColumn('numeros_revista', 'volumen_id');
    }
}
