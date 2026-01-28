import type {Request,Response} from 'express'
import { shortenPostRequestBodySchema } from '../validation/request.validation.ts'
import { urlTable } from '../models/index.ts';
import { nanoid } from 'nanoid';
import db from '../db/index.ts';

const shortURL =async(req:Request,res:Response)=>{
    const validationResult = await shortenPostRequestBodySchema.safeParseAsync(req.body);

    if (validationResult.error) {
        return res.status(400).json({ error: validationResult.error.format() });
    }

    const { url, code } = validationResult.data;

    const shortCode = code ?? nanoid(6);

    const [result] = await db
    .insert(urlTable)
    .values({
        shortCode,
        targetURL: url,
        userId: req.user.id,
    })
    .returning({
        id: urlTable.id,
        shortCode: urlTable.shortCode,
        targetURL: urlTable.targetURL,
    });

    return res.status(201).json({
    id: result.id,
    shortCode: result.shortCode,
    targetURL: result.targetURL,
  });
}
const orgURL =async(req:Request,res:Response)=>{

}
const deleteURL =async(req:Request,res:Response)=>{

}
const getAllURL=async(req:Request,res:Response)=>{

}

export {
    shortURL,orgURL,deleteURL,getAllURL
}