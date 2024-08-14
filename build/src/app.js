"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const emailController_1 = require("./controllers/emailController");
const whatsappController_1 = require("./controllers/whatsappController");
const whatsappService_1 = require("./services/whatsappService");
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.get("/fetch-emails", async (req, res) => {
    // try {
    //   const connection = await imaps.connect(config);
    //   await connection.openBox('INBOX');
    //   const searchCriteria = ['ALL'];
    //   const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };
    //   const messages = await connection.search(searchCriteria, fetchOptions);
    //   const emails = await Promise.all(
    //     messages.map(async (message) => {
    //       if (!message.parts) {
    //         return {
    //           subject: 'No subject',
    //           from: 'Unknown',
    //           date: 'Unknown',
    //           body: 'No body',
    //         };
    //       }
    //       try {
    //         const parts = await imaps.getParts(message);
    //         const headerPart = parts.find((part) => part.which === 'HEADER');
    //         const bodyPart = parts.find((part) => part.which === 'TEXT');
    //         console.log('Fetched message', message, " parts ", parts);
    //         return {
    //           subject: headerPart?.body.subject ? headerPart.body.subject[0] : 'No subject',
    //           from: headerPart?.body.from ? headerPart.body.from[0] : 'Unknown',
    //           date: headerPart?.body.date ? headerPart.body.date[0] : 'Unknown',
    //           body: bodyPart ? bodyPart.body : 'No body',
    //         };
    //       } catch (err) {
    //         console.error('Error processing message parts:', err);
    //         return {
    //           subject: 'Error',
    //           from: 'Unknown',
    //           date: 'Unknown',
    //           body: 'Error processing email',
    //         };
    //       }
    //     })
    //   );
    //   res.json(emails);
    //   connection.end();
    // } catch (error) {
    //   console.error('Error fetching emails:', error);
    //   res.status(500).send('Failed to fetch emails');
    // }
    (0, emailController_1.getEmails)(req, res);
});
//whatsapp routes
app.get("/init-wa", async (req, res) => {
    (0, whatsappController_1.startWhatsApp)(req, res);
});
app.post("/send-msg", (req, res) => {
    (0, whatsappService_1.sendWhatsappMessage)(req, res);
});
app.get("/fetch-msg", (req, res) => {
    (0, whatsappService_1.showMessages)(req, res);
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
