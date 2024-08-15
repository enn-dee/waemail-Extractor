import mongoose from "mongoose"
import dotenv from "dotenv"
import { logger } from "../utils/logger";

dotenv.config()

export class ConnectDB{
    private static instance: ConnectDB
    private constructor(){}
    public static getinstance():ConnectDB{
        if(!ConnectDB.instance){
            ConnectDB.instance = new ConnectDB;
        }
        return ConnectDB.instance;
    }
    public async connect(){
        try {
            await mongoose.connect(process.env.MONGO_URI as string);
            logger.info("Connected to DB");
          } catch (err) {
            logger.error("Error connecting to DB", err);
          }
    }
}