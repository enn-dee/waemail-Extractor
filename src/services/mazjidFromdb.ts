import { logger } from "../utils/logger";
import mazjidModel from "../models/mazjid.model";
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

export const findMazjid = async (masjidname:string): Promise<any> => {
    if (masjidname) {
        try {
            const MasjidData = await mazjidModel.findOne({ masjidName: masjidname }).exec();

            if (MasjidData) {
                return MasjidData; 
            } else {
                console.log("No data found for masjid:", masjidname);
                return null; 
            }
        } catch (error) {
            console.error("Error finding masjid data:", error);
            throw error; 
        }
    } else {
        console.log("Masjid name is required.");
        return null; 
    }
};

export const findMasjidByEmail = async (email: string): Promise<any> => {
    if (email) {
        try {
            const cleanEmail = email.replace(/[<>]/g, "");

            const MasjidData = await mazjidModel.findOne({ "externalLinks.url": cleanEmail }).exec();

            if (MasjidData) {
                return MasjidData;
            } else {
                console.log("No data found for masjid with email:", cleanEmail);
                return null;
            }
        } catch (error) {
            console.error("Error finding masjid data by email:", error);
            throw error;
        }
    } else {
        console.log("Email is required.");
        return null;
    }
};
