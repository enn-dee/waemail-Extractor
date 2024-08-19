"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmails = void 0;
const emailService_1 = require("../services/emailService");
const logger_1 = require("../utils/logger");
const getEmails = async (req, res) => {
    try {
        const websites = await (0, emailService_1.fetchEmails)();
        logger_1.logger.info("Emails fetched successfully | getEmails accessed");
        if (websites.length > 0) {
            res.status(200).json({ websites });
        }
        else {
            res.status(200).json({ message: "No relevant masjid data found in emails" });
        }
    }
    catch (error) {
        logger_1.logger.error("Failed to fetch emails | getEmails accessed", error);
        res.status(500).json({ error: "Failed to fetch emails", details: error });
    }
};
exports.getEmails = getEmails;
