import {
    Sequelize
} from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const db = new Sequelize({
    dialect: "sqlite",
    storage: "./config/database.sqlite",
    logging: false
});

export default db;