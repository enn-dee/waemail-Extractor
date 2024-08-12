import { Router } from "express";
import { getEmails } from "../controllers/emailController";

const router = Router();

router.get("/", getEmails);

export default router;
