"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showMessages = exports.sendWhatsappMessage = exports.startWhatsAppClient = void 0;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
let whatsappClient;
// export const startWhatsAppClient = () => {
//   const client = new Client({});
//   client.on("qr", (qr) => {
//     qrcode.generate(qr, { small: true });
//   });
//   client.on("ready", () => {
//     console.log("WhatsApp Client is ready!");
//   });
//   client.on("message", (message) => {
//     console.log(`Received message: ${message.body}`);
//   });
//   client.initialize();
// };
const startWhatsAppClient = () => {
    whatsappClient = new whatsapp_web_js_1.Client({});
    whatsappClient.on("qr", (qr) => {
        console.log("QR code received, scan it with your WhatsApp!");
        qrcode_terminal_1.default.generate(qr, { small: true });
    });
    whatsappClient.on("ready", () => {
        console.log("WhatsApp Client is ready!");
    });
    whatsappClient.on("message", (message) => {
        console.log(`Received message: ${message.body}`);
    });
    whatsappClient.initialize();
};
exports.startWhatsAppClient = startWhatsAppClient;
const sendWhatsappMessage = async (req, res) => {
    const { number, message } = req.body;
    try {
        const chatId = `${number}@c.us`;
        await whatsappClient.sendMessage(chatId, message);
        res.json({ status: "Message sent successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to send message", details: error });
    }
};
exports.sendWhatsappMessage = sendWhatsappMessage;
const fetchMessages = async (number) => {
    const chatId = `${number}@c.us`;
    const chat = await whatsappClient.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit: 50 });
    return messages;
};
const showMessages = async (req, res) => {
    const { number } = req.body;
    try {
        const messages = await fetchMessages(number);
        const messageBodies = messages.map((msg) => ({
            id: msg.id.id,
            from: msg.from,
            body: msg.body,
            timestamp: msg.timestamp,
        }));
        res.json({ status: "Success", messages: messageBodies });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch messages", details: error });
    }
};
exports.showMessages = showMessages;
