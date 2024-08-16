"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmails = void 0;
const emailService_1 = require("../services/emailService");
const logger_1 = require("../utils/logger");
const getEmails = async (req, res) => {
    try {
        await (0, emailService_1.fetchEmails)();
        logger_1.logger.info("Emails fetched successfully | getEmails accessed");
        res.status(200).send("Emails fetched successfully");
    }
    catch (error) {
        res.status(500).send("Failed to fetch emails");
    }
};
exports.getEmails = getEmails;
