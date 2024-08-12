import { Request, Response } from "express";
import { fetchEmails } from "../services/emailService";

export const getEmails = async (req: Request, res: Response) => {
  try {
    await fetchEmails();
    res.status(200).send("Emails fetched successfully");
  } catch (error) {
    res.status(500).send("Failed to fetch emails");
  }
};
