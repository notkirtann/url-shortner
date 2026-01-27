import express from "express";
import type { Router } from "express";
import { createUser } from "../controllers/user.controller.ts";

const router:Router = express.Router()

router.post('/signup',createUser)
router.post('/login',createUser)


export default router;