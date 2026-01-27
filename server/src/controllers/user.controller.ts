import type { Request,Response } from "express";
import {db} from '../db/index.ts'
import {userTable} from '../models/index.ts'
import { signupPostReqBodySchema } from "../validation/request.validation.ts";
import { hashPasswordWithSalt } from "../utils/hash.ts";
import { getUserByEmail } from "../services/user.service.ts";

const createUser = async (req:Request,res:Response)=>{
    const validationResult = await signupPostReqBodySchema.safeParseAsync(req.body);

    if(validationResult.error) return res.status(400).json({error:validationResult.error.format()})
    
    const {firstName,lastName,email,password} = validationResult.data

    const {existingUser} = await getUserByEmail(email); 

    if(existingUser) return res.json({error:`User with this email already exist`});

    const {salt,hashedPass} = hashPasswordWithSalt(password)    

    const [user] = await db.insert(userTable).values({firstName,lastName,email,password:hashedPass,salt})
                    .returning({id:userTable.id});
    
    return res.status(201).json({data:{userId:user.id}})
}


export {
    createUser
}