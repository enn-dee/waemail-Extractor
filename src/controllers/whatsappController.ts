import { Request, Response } from "express";
import { startWhatsAppClient } from "../services/whatsappService";

export const startWhatsApp = (req: Request, res: Response) => {
  try {
    // startWhatsAppClient();
    startWhatsAppClient();
    res.status(200).send("WhatsApp client started");
  } catch (error) {
    res.status(500).send("Failed to start WhatsApp client");
  }
};
