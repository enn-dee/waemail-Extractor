import express, { Request, Response } from "express";
import imaps from "imap-simple";

import EmailRouter from "./routes/emailRoutes";
import WhatsappRouter from "./routes/whatsappRoutes";
import { logger } from "./utils/logger";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/api", EmailRouter);

app.use("/api", WhatsappRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
