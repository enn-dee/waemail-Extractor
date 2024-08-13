"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmails = void 0;
const emailService_1 = require("../services/emailService");
const getEmails = async (req, res) => {
    try {
        await (0, emailService_1.fetchEmails)();
        res.status(200).send("Emails fetched successfully");
    }
    catch (error) {
        res.status(500).send("Failed to fetch emails");
    }
};
exports.getEmails = getEmails;
