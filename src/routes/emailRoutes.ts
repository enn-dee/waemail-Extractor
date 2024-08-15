import { Router } from "express";
import { getEmails } from "../controllers/emailController";

const router = Router();

router.get("/fetch-emails", getEmails);

export default router;
