"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWhatsApp = void 0;
const whatsappService_1 = require("../services/whatsappService");
const logger_1 = require("../utils/logger");
const startWhatsApp = (req, res) => {
    try {
        logger_1.logger.info("whatsapp init controller running");
        (0, whatsappService_1.startWhatsAppClient)();
        res.status(200).send("WhatsApp client started");
    }
    catch (error) {
        res.status(500).send("Failed to start WhatsApp client");
    }
};
exports.startWhatsApp = startWhatsApp;
