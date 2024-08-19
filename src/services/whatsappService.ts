import { Client, Message } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { Request, Response } from "express";
import { logger } from "../utils/logger";

let whatsappClient: Client;

export const startWhatsAppClient = () => {
  logger.info("Accessed whatsapp client init service");

  whatsappClient = new Client({});

  whatsappClient.on("qr", (qr) => {
    console.log("QR code received, scan it with your WhatsApp!");
    qrcode.generate(qr, { small: true });
  });

  whatsappClient.on("ready", async () => {
    logger.info("WhatsApp ready event accessed");
    console.log("WhatsApp Client is ready!");

    // try {

    //   const chats = await whatsappClient.getChats();
    //   const groupChats = chats.filter(chat => chat.isGroup);

    //   console.log("Group Chats:");
    //   groupChats.forEach(group => {
    //     console.log(`Group Name: ${group.name}, Group ID: ${group.id._serialized}`);
    //   });
    // } catch (error) {
    //   console.error("Failed to retrieve group chats:", error);
    // }
  });

  whatsappClient.on("message", (message) => {
    console.log(`Received message: ${message.body}`);
  });

  whatsappClient.initialize();
};

export const sendContactMessage = async (req: Request, res: Response) => {
  const { number, message } = req.body;

  try {
    const chatId = `${number}@c.us`;
    await whatsappClient.sendMessage(chatId, message);
    logger.info("Message sent via whatsapp sucessfully");
    res.json({ status: "Message sent successfully" });
  } catch (error) {
    logger.error("Failed to send message| sendWhatsappMessage Service ");
    res.status(500).json({ error: "Failed to send message", details: error });
  }
};

export const sendGroupMessage = async (req: Request, res: Response) => {
  const { groupID, message } = req.body;

  try {
    const chatId = `${groupID}@g.us`;
    await whatsappClient.sendMessage(chatId, message);
    logger.info("Message sent via whatsapp sucessfully");
    res.json({ status: "Message sent successfully" });
  } catch (error) {
    logger.error("Failed to send message| sendWhatsappMessage Service ");
    res.status(500).json({ error: "Failed to send message", details: error });
  }
};

const fetchContactMessages = async (number: string): Promise<Message[]> => {
  const chatId = `${number}@c.us`;
  const chat = await whatsappClient.getChatById(chatId);
  const messages = await chat.fetchMessages({ limit: 10 });
  return messages;
};

const fetchGroupMessages = async (groupId: string): Promise<Message[]> => {
  const chatId = `${groupId}@g.us`;
  const chat = await whatsappClient.getChatById(chatId);
  const messages = await chat.fetchMessages({ limit: 10 });
  return messages;
};

export const showContactMessages = async (req: Request, res: Response) => {
  const { number } = req.body;

  try {
    const messages = await fetchContactMessages(number);
    const messageBodies = messages.map((msg) => ({
      id: msg.id.id,
      from: msg.from,
      body: msg.body,
      timestamp: msg.timestamp,
    }));
    logger.info("Fetched whatsapp messages");
    res.json({ status: "Success", messages: messageBodies });
  } catch (error) {
    logger.info("Failed to fetch messages");
    res.status(500).json({ error: "Failed to fetch messages", details: error });
  }
};

export const showGroupMessages = async (req: Request, res: Response) => {
  const { groupID } = req.body;

  try {
    const messages = await fetchGroupMessages(groupID);
    const messageBodies = messages.map((msg) => ({
      id: msg.id.id,
      from: msg.from,
      body: msg.body,
      timestamp: msg.timestamp,
    }));
    logger.info("Fetched Group messages");
    res.json({ status: "Success", messages: messageBodies });
  } catch (error) {
    logger.error("Failed to fetch Group messages");
    res
      .status(500)
      .json({ error: "Failed to fetch Group messages", details: error });
  }
};

export const fetchAndFilterGroupMessages = async (
  req: Request,
  res: Response
) => {
  const { groupID } = req.body;

  try {
  

    const chats = await whatsappClient.getChats();

    const groupChat = chats.find(
      (chat) => chat.isGroup && chat.id === groupID
    );

    if (!groupChat) {
      logger.error(`Group with id ${groupID} not found.`);
      return res
        .status(404)
        .json({ error: `Group with id ${groupID} not found.` });
    }

    const messages = await groupChat.fetchMessages({ limit: 50 });

    const prayerKeywords = [
      "prayer",
      "Fajr",
      "Dhuhr",
      "Asr",
      "Maghrib",
      "Isha",
    ];

    const prayerMessages = messages.filter((msg) =>
      prayerKeywords.some((keyword) =>
        msg.body.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    if (prayerMessages.length > 0) {
      logger.info(
        `Found ${prayerMessages.length} messages containing prayer timings.`
      );
      res.json({
        status: "Success",
        prayerMessages: prayerMessages.map((msg) => msg.body),
      });
    } else {
      logger.info("No messages containing prayer timings found.");
      res.json({ status: "No prayer timings found" });
    }
  } catch (error) {
    logger.error("Failed to fetch and filter group messages", error);
    res.status(500).json({
      error: "Failed to fetch and filter group messages",
      details: error,
    });
  }
};
