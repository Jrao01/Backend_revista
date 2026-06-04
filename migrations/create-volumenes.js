export async function up(queryInterface, Sequelize, helpers = {}) {
    const exists = helpers.tableExists
        ? await helpers.tableExists('volumenes')
        : false;
    if (exists) return;

    await queryInterface.createTable('volumenes', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        revista_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'revistas', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        numero_volumen: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });

    await queryInterface.addIndex('volumenes', ['revista_id', 'numero_volumen'], {
        unique: true,
        name: 'uq_volumenes_revista_numero_volumen'
    });
}

export async function down(queryInterface) {
    await queryInterface.dropTable('volumenes');
}
