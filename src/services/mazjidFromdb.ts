import mazjidModel from "../models/mazjid.model";
// import { ConnectDB } from "../config/database";

export const findMazjid = async (masjidname:string) => {
  //   const db = ConnectDB.getinstance();
  //   const collection = db.dbcollection();

  //   const data = await collection.findOne({
  //     masjidName: fromEmail,
  //   });
  //   console.log("Masjid Data: ", data);
  if (masjidname) {
    const nameData = await mazjidModel
      .findOne({
        masjidName: masjidname,
      })
      .exec();
    if (nameData) {
        console.log("masjid name ",masjidname)
      console.log("Masjid Data ", nameData);
    } else {
      
      console.log("No data found for masjid: ", masjidname);
    }
  }
};

// export const findMazjid = async (masjidname="IALFM"): Promise<any> => {
//     if (masjidname) {
//         try {
//             // Find the masjid data by name
//             const emailData = await mazjidModel.findOne({ masjidName: masjidname }).exec();

//             // Check if the data exists
//             if (emailData) {
//                 return emailData; // Return the found data
//             } else {
//                 console.log("No data found for masjid:", masjidname);
//                 return null; // Return null if no data found
//             }
//         } catch (error) {
//             console.error("Error finding masjid data:", error);
//             throw error; // Re-throw the error after logging it
//         }
//     } else {
//         console.log("Masjid name is required.");
//         return null; // Return null if no masjid name is provided
//     }
// };
