import type {Request,Response} from 'express'
import { shortenPostRequestBodySchema } from '../validation/request.validation.ts'
import { urlTable } from '../models/index.ts';
import { nanoid } from 'nanoid';
import db from '../db/index.ts';
import { and, eq } from 'drizzle-orm';

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
const orgURL =async(req:Request,res:Response)=> {
  const codes = await db
    .select()
    .from(urlTable)
    .where(eq(urlTable.userId, req.user.id));

  return res.json({ codes });
}

const deleteURL =async(req:Request,res:Response)=>{
  const id = req.params.id;
  await db
    .delete(urlTable)
    .where(and(eq(urlTable.id, id), eq(urlTable.userId, req.user.id)));

  return res.status(200).json({ deleted: true });
}
const getAllURL=async(req:Request,res:Response)=>{
  const code = req.params.shortCode;
  const [result] = await db
    .select({
      targetURL: urlTable.targetURL,
    })
    .from(urlTable)
    .where(eq(urlTable.shortCode, code));

  if (!result) {
    return res.status(404).json({ error: 'Invalid URL' });
  }

  return res.redirect(result.targetURL);
}

export {
    shortURL,orgURL,deleteURL,getAllURL
}