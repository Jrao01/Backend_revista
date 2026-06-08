export async function up(queryInterface, Sequelize, helpers = {}) {
  const columnExists = async (table, col) => {
    const desc = await queryInterface.describeTable(table);
    return col in desc;
  };

  // 1. Add area_id to programas (if not exists)
  if (!(await columnExists('programas', 'area_id'))) {
    await queryInterface.addColumn('programas', 'area_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // temporarily nullable for data migration
      references: { model: 'areas', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }

  // 2. Add programa_id to lineas_investigacion (if not exists)
  if (!(await columnExists('lineas_investigacion', 'programa_id'))) {
    await queryInterface.addColumn('lineas_investigacion', 'programa_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // temporarily nullable for data migration
      references: { model: 'programas', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }

  // 3. Migrate data: lineas_investigacion.area_id → programa_id
  //    Current: linea.area_id points to Area. New: linea.programa_id points to Programa.
  //    We need to find the programa that owns each area, then set programa_id on the linea.
  if (await columnExists('lineas_investigacion', 'area_id')) {
    const hasAreaIdOnAreas = await columnExists('areas', 'programa_id');
    if (hasAreaIdOnAreas) {
      const lineas = await queryInterface.sequelize.query(
        `SELECT l.id as linea_id, a.programa_id
         FROM lineas_investigacion l
         INNER JOIN areas a ON a.id = l.area_id`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      for (const linea of lineas) {
        await queryInterface.sequelize.query(
          `UPDATE lineas_investigacion SET programa_id = ${linea.programa_id} WHERE id = ${linea.linea_id}`
        );
      }
    }
  }

  // 4. Migrate data: areas.programa_id → area_id on programas
  //    Current: area.programa_id points to Programa. New: programa.area_id points to Area.
  //    We need to set each programa's area_id based on which area currently references it.
  if (await columnExists('areas', 'programa_id')) {
    const programas = await queryInterface.sequelize.query(
      `SELECT p.id as prog_id, a.id as area_id
       FROM programas p
       INNER JOIN areas a ON a.programa_id = p.id`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const prog of programas) {
      await queryInterface.sequelize.query(
        `UPDATE programas SET area_id = ${prog.area_id} WHERE id = ${prog.prog_id}`
      );
    }
  }

  // 5. Make area_id NOT NULL on programas now that data is migrated
  const progDesc = await queryInterface.describeTable('programas');
  if (progDesc.area_id && progDesc.area_id.allowNull) {
    await queryInterface.changeColumn('programas', 'area_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'areas', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }

  // 6. Make programa_id NOT NULL on lineas_investigacion
  const lineasDesc = await queryInterface.describeTable('lineas_investigacion');
  if (lineasDesc.programa_id && lineasDesc.programa_id.allowNull) {
    await queryInterface.changeColumn('lineas_investigacion', 'programa_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'programas', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }

  // 7. Remove old FK columns
  if (await columnExists('lineas_investigacion', 'area_id')) {
    await queryInterface.removeColumn('lineas_investigacion', 'area_id');
  }
  if (await columnExists('areas', 'programa_id')) {
    await queryInterface.removeColumn('areas', 'programa_id');
  }
}

export async function down(queryInterface) {
  const columnExists = async (table, col) => {
    const desc = await queryInterface.describeTable(table);
    return col in desc;
  };

  // Reverse: add back old FKs
  if (!(await columnExists('areas', 'programa_id'))) {
    await queryInterface.addColumn('areas', 'programa_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'programas', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }

  if (!(await columnExists('lineas_investigacion', 'area_id'))) {
    await queryInterface.addColumn('lineas_investigacion', 'area_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'areas', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }

  // Remove new FK columns
  if (await columnExists('programas', 'area_id')) {
    await queryInterface.removeColumn('programas', 'area_id');
  }
  if (await columnExists('lineas_investigacion', 'programa_id')) {
    await queryInterface.removeColumn('lineas_investigacion', 'programa_id');
  }
}
