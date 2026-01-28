import express from "express"
import type {Router} from 'express'
import { ensureAuthenticated } from "../middleware/auth.middleware.ts"
import { getAllURL,shortURL,orgURL,deleteURL } from "../controllers/url.controller.ts"

const router:Router = express.Router()

router.post('/shorten',ensureAuthenticated,shortURL)

router.get('/codes', ensureAuthenticated, orgURL);

router.delete('/:id', ensureAuthenticated, deleteURL);

router.get('/:shortCode', getAllURL);

export default router