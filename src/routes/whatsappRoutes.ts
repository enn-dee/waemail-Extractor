import { Router } from "express";
import { startWhatsApp } from "../controllers/whatsappController";
import { sendWhatsappMessage, showContactMessages, showGroupMessages } from "../services/whatsappService";
const router = Router();

router.get("/init-wa", startWhatsApp);
router.post("/send-msg", sendWhatsappMessage);
router.get("/fetch-cmsg", showContactMessages);
router.get("/fetch-gmsg", showGroupMessages);

export default router;
