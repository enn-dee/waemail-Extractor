"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndFilterGroupMessages = exports.getGroupMessagesByName = exports.showGroupMessages = exports.showContactMessages = exports.sendGroupMessage = exports.sendContactMessage = exports.startWhatsAppClient = void 0;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const logger_1 = require("../utils/logger");
let whatsappClient;
const startWhatsAppClient = () => {
    logger_1.logger.info("Accessed whatsapp client init service");
    whatsappClient = new whatsapp_web_js_1.Client({});
    whatsappClient.on("qr", (qr) => {
        console.log("QR code received, scan it with your WhatsApp!");
        qrcode_terminal_1.default.generate(qr, { small: true });
    });
    whatsappClient.on("ready", async () => {
        logger_1.logger.info("WhatsApp ready event accessed");
        console.log("WhatsApp Client is ready!");
        // try {
        //   const chats = await whatsappClient.getChats();
        //   const groupChats = chats.filter((chat) => chat.isGroup);
        //   console.log("Group Chats:");
        //   groupChats.forEach((group) => {
        //     console.log(
        //       `Group Name: ${group.name}, Group ID: ${group.id._serialized}`
        //     );
        //   });
        // } catch (error) {
        //   console.error("Failed to retrieve group chats:", error);
        // }
    });
    whatsappClient.on("message", (message) => {
        console.log(`Received message: ${message.body}`);
    });
    whatsappClient.initialize();
};
exports.startWhatsAppClient = startWhatsAppClient;
const sendContactMessage = async (req, res) => {
    const { number, message } = req.body;
    try {
        const chatId = `${number}@c.us`;
        await whatsappClient.sendMessage(chatId, message);
        logger_1.logger.info("Message sent via whatsapp sucessfully");
        res.json({ status: "Message sent successfully" });
    }
    catch (error) {
        logger_1.logger.error("Failed to send message| sendWhatsappMessage Service ");
        res.status(500).json({ error: "Failed to send message", details: error });
    }
};
exports.sendContactMessage = sendContactMessage;
const sendGroupMessage = async (req, res) => {
    const { groupID, message } = req.body;
    try {
        const chatId = `${groupID}@g.us`;
        await whatsappClient.sendMessage(chatId, message);
        logger_1.logger.info("Message sent via whatsapp sucessfully");
        res.json({ status: "Message sent successfully" });
    }
    catch (error) {
        logger_1.logger.error("Failed to send message| sendWhatsappMessage Service ");
        res.status(500).json({ error: "Failed to send message", details: error });
    }
};
exports.sendGroupMessage = sendGroupMessage;
const fetchContactMessages = async (number) => {
    const chatId = `${number}@c.us`;
    const chat = await whatsappClient.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit: 10 });
    return messages;
};
const fetchGroupMessages = async (groupId) => {
    const chatId = `${groupId}@g.us`;
    const chat = await whatsappClient.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit: 10 });
    return messages;
};
const showContactMessages = async (req, res) => {
    const { number } = req.body;
    try {
        const messages = await fetchContactMessages(number);
        const messageBodies = messages.map((msg) => ({
            id: msg.id.id,
            from: msg.from,
            body: msg.body,
            timestamp: msg.timestamp,
        }));
        logger_1.logger.info("Fetched whatsapp messages");
        res.json({ status: "Success", messages: messageBodies });
    }
    catch (error) {
        logger_1.logger.info("Failed to fetch messages");
        res.status(500).json({ error: "Failed to fetch messages", details: error });
    }
};
exports.showContactMessages = showContactMessages;
const showGroupMessages = async (req, res) => {
    const { groupID } = req.body;
    try {
        const messages = await fetchGroupMessages(groupID);
        const messageBodies = messages.map((msg) => ({
            id: msg.id.id,
            from: msg.from,
            body: msg.body,
            timestamp: msg.timestamp,
        }));
        logger_1.logger.info("Fetched Group messages");
        res.json({ status: "Success", messages: messageBodies });
    }
    catch (error) {
        logger_1.logger.error("Failed to fetch Group messages");
        res
            .status(500)
            .json({ error: "Failed to fetch Group messages", details: error });
    }
};
exports.showGroupMessages = showGroupMessages;
const fetchGroupMessagesByName = async (groupName) => {
    try {
        const chats = await whatsappClient.getChats();
        const groupChat = chats.find((chat) => chat.isGroup && chat.name.toLowerCase() === groupName.toLowerCase());
        if (!groupChat) {
            throw new Error(`Group with name "${groupName}" not found.`);
        }
        const messages = await groupChat.fetchMessages({ limit: 10 });
        return messages;
    }
    catch (error) {
        logger_1.logger.error("Error fetching group messages: ", error);
        throw error;
    }
};
const getGroupMessagesByName = async (req, res) => {
    const { groupName } = req.body;
    try {
        if (!groupName) {
            return res.status(400).json({ error: "Group name is required." });
        }
        const messages = await fetchGroupMessagesByName(groupName);
        if (!messages || messages.length === 0) {
            return res.status(404).json({ message: "No messages found in the group." });
        }
        const formattedMessages = messages.map((msg) => ({
            id: msg.id.id,
            from: msg.from,
            body: msg.body,
            timestamp: msg.timestamp,
        }));
        logger_1.logger.info(`Fetched messages from group: ${groupName}`);
        return res.status(200).json({ messages: formattedMessages });
    }
    catch (error) {
        logger_1.logger.error("Failed to fetch group messages:", error);
        return res.status(500).json({ error: "Failed to fetch group messages", details: error });
    }
};
exports.getGroupMessagesByName = getGroupMessagesByName;
const fetchAndFilterGroupMessages = async (req, res) => {
    const { groupID } = req.body;
    try {
        const chats = await whatsappClient.getChats();
        const groupChat = chats.find((chat) => chat.isGroup && chat.id === groupID);
        if (!groupChat) {
            logger_1.logger.error(`Group with id ${groupID} not found.`);
            return res
                .status(404)
                .json({ error: `Group with id ${groupID} not found.` });
        }
        const messages = await groupChat.fetchMessages({ limit: 50 });
        const prayerKeywords = [
            "prayer",
            "Fajr",
            "Dhuhr",
            "Asr",
            "Maghrib",
            "Isha",
        ];
        const prayerMessages = messages.filter((msg) => prayerKeywords.some((keyword) => msg.body.toLowerCase().includes(keyword.toLowerCase())));
        if (prayerMessages.length > 0) {
            logger_1.logger.info(`Found ${prayerMessages.length} messages containing prayer timings.`);
            res.json({
                status: "Success",
                prayerMessages: prayerMessages.map((msg) => msg.body),
            });
        }
        else {
            logger_1.logger.info("No messages containing prayer timings found.");
            res.json({ status: "No prayer timings found" });
        }
    }
    catch (error) {
        logger_1.logger.error("Failed to fetch and filter group messages", error);
        res.status(500).json({
            error: "Failed to fetch and filter group messages",
            details: error,
        });
    }
};
exports.fetchAndFilterGroupMessages = fetchAndFilterGroupMessages;
