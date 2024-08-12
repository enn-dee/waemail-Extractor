import { Router } from "express";
import { startWhatsApp } from "../controllers/whatsappController";

const router = Router();

router.get("/", startWhatsApp);

export default router;
