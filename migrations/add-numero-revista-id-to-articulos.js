export async function up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('articulos');

    if (table.numero_id && !table.numero_revista_id) {
        await queryInterface.renameColumn('articulos', 'numero_id', 'numero_revista_id');
    } else if (!table.numero_revista_id) {
        await queryInterface.addColumn('articulos', 'numero_revista_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'numeros_revista',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });
    }
}

export async function down(queryInterface) {
    const table = await queryInterface.describeTable('articulos');

    if (table.numero_revista_id && !table.numero_id) {
        await queryInterface.renameColumn('articulos', 'numero_revista_id', 'numero_id');
    } else if (table.numero_revista_id) {
        await queryInterface.removeColumn('articulos', 'numero_revista_id');
    }
}
