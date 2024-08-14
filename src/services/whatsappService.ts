import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { Request, Response } from "express";

let whatsappClient: Client;

// export const startWhatsAppClient = () => {

//   const client = new Client({});

//   client.on("qr", (qr) => {
//     qrcode.generate(qr, { small: true });
//   });

//   client.on("ready", () => {
//     console.log("WhatsApp Client is ready!");
//   });

//   client.on("message", (message) => {
//     console.log(`Received message: ${message.body}`);
//   });

//   client.initialize();
// };

export const startWhatsAppClient = () => {
  whatsappClient = new Client({});

  whatsappClient.on("qr", (qr) => {
    console.log("QR code received, scan it with your WhatsApp!");
    qrcode.generate(qr, { small: true });
  });

  whatsappClient.on("ready", () => {
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
    res.json({ status: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message", details: error });
  }
};

