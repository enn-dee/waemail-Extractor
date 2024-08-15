"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const whatsappController_1 = require("./controllers/whatsappController");
const whatsappService_1 = require("./services/whatsappService");
const emailRoutes_1 = __importDefault(require("./routes/emailRoutes"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use("/fetch-emails", emailRoutes_1.default);
//whatsapp routes
app.use("/init-wa", async (req, res) => {
    (0, whatsappController_1.startWhatsApp)(req, res);
});
app.use("/send-msg", (req, res) => {
    (0, whatsappService_1.sendWhatsappMessage)(req, res);
});
app.use("/fetch-msg", (req, res) => {
    (0, whatsappService_1.showMessages)(req, res);
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
