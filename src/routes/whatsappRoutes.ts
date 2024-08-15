import { Router } from "express";
import { startWhatsApp } from "../controllers/whatsappController";
import { sendWhatsappMessage, showMessages } from "../services/whatsappService";
const router = Router();

router.get("/init-wa", startWhatsApp);
router.post("/send-msg", sendWhatsappMessage);
router.get("/fetch-msg", showMessages);

export default router;
