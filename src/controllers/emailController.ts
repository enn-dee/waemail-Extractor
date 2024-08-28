import { Request, Response } from "express";
import EmailProcessor from "../services/emailService";
import { logger } from "../utils/logger";

export const getEmails = async (req: Request, res: Response) => {
  try {
    const emailProcessor = new EmailProcessor();
    const websites = await emailProcessor.fetchEmails();
    logger.info("Emails fetched successfully | getEmails func accessed");

    if (websites.length > 0) {
      res.status(200).json({ websites });
    } else {
      res.status(200).json({ message: "No relevant masjid data found in emails" });
    }
  } catch (error) {
    logger.error("Failed to fetch emails | getEmails accessed", error);
    res.status(500).json({ error: "Failed to fetch emails", details: error });
  }
};
