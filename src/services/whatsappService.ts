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

  whatsappClient.on("ready", () => {
    logger.info("whatsapp ready event accessed");
    console.log("WhatsApp Client is ready!");
  });

  whatsappClient.on("message", (message) => {
    console.log(`Received message: ${message.body}`);
  });

  whatsappClient.initialize();
};

export const sendWhatsappMessage = async (req: Request, res: Response) => {
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

const fetchMessages = async (number: string): Promise<Message[]> => {
  const chatId = `${number}@c.us`;
  const chat = await whatsappClient.getChatById(chatId);
  const messages = await chat.fetchMessages({ limit: 50 });
  return messages;
};

export const showMessages = async (req: Request, res: Response) => {
  const { number } = req.body;

  try {
    const messages = await fetchMessages(number);
    const messageBodies = messages.map((msg) => ({
      id: msg.id.id,
      from: msg.from,
      body: msg.body,
      timestamp: msg.timestamp,
    }));
    logger.info("Fetched whatsapp messages")
    res.json({ status: "Success", messages: messageBodies });
  } catch (error) {
    logger.info("Failed to fetch messages")
    res.status(500).json({ error: "Failed to fetch messages", details: error });
  }
};
