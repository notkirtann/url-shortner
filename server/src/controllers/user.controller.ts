import type { Request,Response } from "express";
import {db} from '../db/index.ts'
import {userTable} from '../models/index.ts'
import { signupPostReqBodySchema, loginPostReqBodySchema } from "../validation/request.validation.ts";
import { hashPasswordWithSalt } from "../utils/hash.ts";
import { getUserByEmail } from "../services/user.service.ts";
import jwt from 'jsonwebtoken'

const createUser = async (req:Request,res:Response)=>{
    const validationResult = await signupPostReqBodySchema.safeParseAsync(req.body);

    if(validationResult.error) return res.status(400).json({error:validationResult.error.format()})
    
    const {firstName,lastName,email,password} = validationResult.data

    const existingUser = await getUserByEmail(email); 

    if(existingUser) return res.json({error:`User with this email already exist`});

    const {salt,hashedPass} = hashPasswordWithSalt(password)    

    const [user] = await db.insert(userTable).values({firstName,lastName,email,password:hashedPass,salt})
                    .returning({id:userTable.id});
    
    return res.status(201).json({data:{userId:user.id}})
}

const login = async (req:Request,res:Response)=>{
    const validationResult = await loginPostReqBodySchema.safeParseAsync(req.body);

    if(validationResult.error) return res.status(400).json({error:validationResult.error.format()})

    const {email,password} = validationResult.data

    const user = await getUserByEmail(email); 

    if(!user) return res.json({error:`User with this email doesnt exist`});

    const {hashedPass} = hashPasswordWithSalt(password,user.salt)

    if(user.password!==hashedPass) return res.status(400).json({error:'incorrect password'})

    const token = jwt.sign({id:user.id},process.env.JWT_SECRET!)

    return res.json({token})
}

const updateUser = async (req:Request,res:Response)=>{

}
const deleteUser = async (req:Request,res:Response)=>{

}


export {
    createUser, login, updateUser, deleteUser
}