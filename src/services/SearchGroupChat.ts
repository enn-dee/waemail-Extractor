// import { Request, Response } from "express";
// import { logger } from "../utils/logger";
// import { Client } from "whatsapp-web.js";

// let whatsappClient: Client;
// export const fetchAndFilterGroupMessages = async (
//   req: Request,
//   res: Response
// ) => {
//   const { groupID } = req.body;

//   try {
//     const chats = await whatsappClient.getChats();

//     const groupChat = chats.find(
//       (chat) => chat.isGroup && chat.name === groupID
//     );

//     if (!groupChat) {
//       logger.error(`Group with name ${groupID} not found.`);
//       return res
//         .status(404)
//         .json({ error: `Group with name ${groupID} not found.` });
//     }

//     const messages = await groupChat.fetchMessages({ limit: 50 });

//     const prayerKeywords = [
//       "prayer",
//       "Fajr",
//       "Dhuhr",
//       "Asr",
//       "Maghrib",
//       "Isha",
//     ];

//     const prayerMessages = messages.filter((msg) =>
//       prayerKeywords.some((keyword) =>
//         msg.body.toLowerCase().includes(keyword.toLowerCase())
//       )
//     );

//     if (prayerMessages.length > 0) {
//       logger.info(
//         `Found ${prayerMessages.length} messages containing prayer timings.`
//       );
//       res.json({
//         status: "Success",
//         prayerMessages: prayerMessages.map((msg) => msg.body),
//       });
//     } else {
//       logger.info("No messages containing prayer timings found.");
//       res.json({ status: "No prayer timings found" });
//     }
//   } catch (error) {
//     logger.error("Failed to fetch and filter group messages", error);
//     res
//       .status(500)
//       .json({
//         error: "Failed to fetch and filter group messages",
//         details: error,
//       });
//   }
// };
