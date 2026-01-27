import type { Request,Response } from "express";
import {db} from '../db/index'
import {userTable} from '../models/index.ts'
import { eq } from "drizzle-orm";
import { createHmac, randomBytes } from "node:crypto";
import { signupPostReqBodySchema } from "../validation/request.validation";

const createUser = async (req:Request,res:Response)=>{
    const validationResult = await signupPostReqBodySchema.safeParseAsync(req.body);

    if(validationResult.error) return res.status(400).json({error:validationResult.error.format()})
    
    const {firstName,lastName,email,password} = validationResult.data

    const [existingUser] = await db.select({id:userTable.id}).from(userTable).where(eq(userTable.email,email))

    if(existingUser) return res.json({error:`User with this email already exist`});

    const salt = randomBytes(256).toString('hex')
    const hashedPass = createHmac('sha-256',salt).update(password).digest('hex')

    const [user] = await db.insert(userTable).values({firstName,lastName,email,password:hashedPass,salt})
                    .returning({id:userTable.id});
    
    return res.status(201).json({data:{userId:user.id}})
}


export {
    createUser
}