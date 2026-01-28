import express from "express";
import type { Router } from "express";
import { createUser, login, updateUser, deleteUser } from "../controllers/user.controller.ts";
import {ensureAuthenticated} from '../middleware/auth.middleware.ts'
const router:Router = express.Router()

router.post('/signup',createUser)
router.post('/login',login)
router.patch('/update', ensureAuthenticated, updateUser);  
router.delete('/delete', ensureAuthenticated, deleteUser);

export default router;