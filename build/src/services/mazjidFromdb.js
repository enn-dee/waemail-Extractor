"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMasjidByEmail = exports.findMazjid = void 0;
const mazjid_model_1 = __importDefault(require("../models/mazjid.model"));
// import { ConnectDB } from "../config/database";
// export const findMazjid = async (masjidname:string) => {
//   const db = ConnectDB.getinstance();
//   const collection = db.dbcollection();
//   const data = await collection.findOne({
//     masjidName: fromMasjid,
//   });
//   console.log("Masjid Data: ", data);
//   if (masjidname) {
//     const nameData = await mazjidModel
//       .findOne({
//         masjidName: masjidname,
//       })
//       .exec();
//     if (nameData) {
//        logger.info(`found data for masjid: ${masjidname}`)
//       console.log("Masjid Data ", nameData);
//     } else {
//       console.log("No data found for masjid: ", masjidname);
//     }
//   }
// };
const findMazjid = async (masjidname) => {
    if (masjidname) {
        try {
            const MasjidData = await mazjid_model_1.default.findOne({ masjidName: masjidname }).exec();
            if (MasjidData) {
                return MasjidData;
            }
            else {
                console.log("No data found for masjid:", masjidname);
                return null;
            }
        }
        catch (error) {
            console.error("Error finding masjid data:", error);
            throw error;
        }
    }
    else {
        console.log("Masjid name is required.");
        return null;
    }
};
exports.findMazjid = findMazjid;
const findMasjidByEmail = async (email) => {
    if (email) {
        try {
            const cleanEmail = email.replace(/[<>]/g, "");
            const masjidData = await mazjid_model_1.default.find({ "externalLinks.url": cleanEmail }).exec();
            if (masjidData && masjidData.length > 0) {
                return masjidData;
            }
            else {
                console.log("No data found for masjids with email:", cleanEmail);
                return [];
            }
        }
        catch (error) {
            console.error("Error finding masjid data by email:", error);
            throw error;
        }
    }
    else {
        console.log("Email is required.");
        return [];
    }
};
exports.findMasjidByEmail = findMasjidByEmail;
