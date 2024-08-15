import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "../utils/logger";
import { MongoClient } from "mongodb";

dotenv.config();
const URI = process.env.MONGO_URI as string;

export class ConnectDB {
  private static instance: ConnectDB;
  private constructor() {}
  public static getinstance(): ConnectDB {
    if (!ConnectDB.instance) {
      ConnectDB.instance = new ConnectDB();
    }
    return ConnectDB.instance;
  }
  public async connect() {
    try {
      await mongoose.connect(URI);
      logger.info("Connected to DB");
    } catch (err) {
      logger.error("Error connecting to DB", err);
    }
  }

  public dbcollection() {
    const client = new MongoClient(URI);
    const database = client.db("connectMazjid");
    const collection = database.collection("masjids");
    return collection;
  }
}
