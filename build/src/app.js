"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const emailRoutes_1 = __importDefault(require("./routes/emailRoutes"));
const whatsappRoutes_1 = __importDefault(require("./routes/whatsappRoutes"));
const database_1 = require("./config/database");
const EmailService2_1 = __importDefault(require("./services/EmailService2"));
const app = (0, express_1.default)();
const port = Number(process.env.PORT);
const db = database_1.ConnectDB.getinstance();
app.use(express_1.default.json());
app.use("/api", emailRoutes_1.default);
app.use("/api", whatsappRoutes_1.default);
app.listen(port, () => {
    EmailService2_1.default.service.init();
    db.connect();
    console.log(`Server is running on http://localhost:${port}`);
});
