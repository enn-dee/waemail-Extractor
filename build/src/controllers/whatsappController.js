"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWhatsApp = void 0;
const whatsappService_1 = require("../services/whatsappService");
const startWhatsApp = (req, res) => {
    try {
        // startWhatsAppClient();
        (0, whatsappService_1.startWhatsAppClient)();
        res.status(200).send("WhatsApp client started");
    }
    catch (error) {
        res.status(500).send("Failed to start WhatsApp client");
    }
};
exports.startWhatsApp = startWhatsApp;
