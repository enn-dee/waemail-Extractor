import { Request, Response } from "express";
import { fetchEmails } from "../services/emailService";
import { logger } from "../utils/logger";

export const getEmails = async (req: Request, res: Response) => {
  try {
    await fetchEmails();
    logger.info("Emails fetched successfully | getEmails accessed")
    res.status(200).send("Emails fetched successfully");
  } catch (error) {
    res.status(500).send("Failed to fetch emails");
  }
};
