import { Router } from "express";
import { startWhatsApp } from "../controllers/whatsappController";

import { fetchAndFilterGroupMessages, sendContactMessage, sendGroupMessage, showContactMessages, showGroupMessages } from "../services/whatsappService";

const router = Router();

router.get("/init-wa", startWhatsApp);

router.post("/send-cmsg", sendContactMessage);
router.post("/send-gmsg", sendGroupMessage);

router.get("/fetch-cmsg", showContactMessages);
router.get("/fetch-gmsg", showGroupMessages);

router.get("/fetch-prayer", fetchAndFilterGroupMessages);

export default router;
