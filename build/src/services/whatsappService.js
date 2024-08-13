"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWhatsAppClient = void 0;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const startWhatsAppClient = () => {
    const client = new whatsapp_web_js_1.Client({});
    client.on("qr", (qr) => {
        qrcode_terminal_1.default.generate(qr, { small: true });
    });
    client.on("ready", () => {
        console.log("WhatsApp Client is ready!");
    });
    client.on("message", (message) => {
        console.log(`Received message: ${message.body}`);
    });
    client.initialize();
};
exports.startWhatsAppClient = startWhatsAppClient;
