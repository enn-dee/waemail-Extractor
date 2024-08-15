import { Request, Response } from "express";
import { startWhatsAppClient } from "../services/whatsappService";
// import { logger } from "../utils/logger";

export const startWhatsApp = (req: Request, res: Response) => {
  try {
    // startWhatsAppClient();
    // logger.info("whatsapp init controller running");
    startWhatsAppClient();
    res.status(200).send("WhatsApp client started");
  } catch (error) {
    res.status(500).send("Failed to start WhatsApp client");
  }
};
