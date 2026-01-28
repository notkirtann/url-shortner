import express from "express";
import type { Router } from "express";
import { createUser, login, updateUser, deleteUser } from "../controllers/user.controller.ts";

const router:Router = express.Router()

router.post('/signup',createUser)
router.post('/login',login)
router.post('/update',updateUser)
router.post('/delete',deleteUser)

export default router;