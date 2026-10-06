import express from "express";
import { register, login } from "../controllers/usercontroller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// ⚠️ THIS LINE FIXES THE SYNTAX ERROR
export default router;