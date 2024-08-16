"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
const mongodb_1 = require("mongodb");
dotenv_1.default.config();
const URI = process.env.MONGO_URI;
class ConnectDB {
    static instance;
    constructor() { }
    static getinstance() {
        if (!ConnectDB.instance) {
            ConnectDB.instance = new ConnectDB();
        }
        return ConnectDB.instance;
    }
    async connect() {
        try {
            await mongoose_1.default.connect(URI);
            logger_1.logger.info("Connected to DB");
        }
        catch (err) {
            logger_1.logger.error("Error connecting to DB", err);
        }
    }
    dbcollection() {
        const client = new mongodb_1.MongoClient(URI);
        const database = client.db("connectMazjid");
        const collection = database.collection("masjids");
        return collection;
    }
}
exports.ConnectDB = ConnectDB;
