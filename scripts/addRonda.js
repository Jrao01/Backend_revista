import db from '../config/conexion.js';

async function run() {
  try {
    await db.query("ALTER TABLE evaluaciones ADD COLUMN ronda INT DEFAULT 1;");
    console.log("Column 'ronda' added successfully.");
  } catch (e) {
    if (e.message?.includes("Duplicate column")) {
      console.log("Column 'ronda' already exists.");
    } else {
      console.error("Error:", e.message || e);
    }
  }
  process.exit(0);
}
run();
