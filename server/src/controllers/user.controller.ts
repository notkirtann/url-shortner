import type { Request,Response } from "express";
import {db} from '../db/index.ts'
import {userTable} from '../models/index.ts'
import { signupPostReqBodySchema, loginPostReqBodySchema, updateUserReqBodySchema } from "../validation/request.validation.ts";
import { hashPasswordWithSalt } from "../utils/hash.ts";
import { getUserByEmail, getUserById, updateUserById, deleteUserById } from "../services/user.service.ts";
import { createUserToken } from "../utils/token.ts";

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

    const token = await createUserToken({id:user.id})

    return res.json({token})
}

const updateUser = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const validationResult = await updateUserReqBodySchema.safeParseAsync(req.body);

    if (validationResult.error) {
        return res.status(400).json({ error: validationResult.error.format() });
    }

    const { firstName, lastName, currentPassword, newPassword } = validationResult.data;

    const user = await getUserById(req.user.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const updateData: {
        firstName?: string;
        lastName?: string;
        password?: string;
        salt?: string;
    } = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    if (currentPassword && newPassword) {
        const { hashedPass: currentHashedPass } = hashPasswordWithSalt(currentPassword, user.salt);
        
        if (user.password !== currentHashedPass) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const { salt: newSalt, hashedPass: newHashedPass } = hashPasswordWithSalt(newPassword);
        updateData.password = newHashedPass;
        updateData.salt = newSalt;
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    const updatedUser = await updateUserById(req.user.id, updateData);

    return res.json({
        message: 'User updated successfully',
        data: {
            id: updatedUser.id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
        }
    });
}

const deleteUser = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await deleteUserById(req.user.id);

        return res.json({
            message: 'User deleted successfully',
            data: {
                id: req.user.id
            }
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ error: 'Failed to delete user' });
    }
}


export {
    createUser, login, updateUser, deleteUser
}