import type { Request, Response } from 'express'
import { shortenPostRequestBodySchema } from '../validation/request.validation.ts'
import { urlTable } from '../models/index.ts';
import { nanoid } from 'nanoid';
import db from '../db/index.ts';
import { and, eq } from 'drizzle-orm';

const shortURL = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const validationResult = await shortenPostRequestBodySchema.safeParseAsync(req.body);

    if (validationResult.error) {
        return res.status(400).json({ error: validationResult.error.format() });
    }

    const { url, code } = validationResult.data;

    const shortCode = code ?? nanoid(6);

    try {
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
    } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Short code already exists' });
        }
        console.error('Error creating short URL:', error);
        return res.status(500).json({ error: 'Failed to create short URL' });
    }
}

const orgURL = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const codes = await db
        .select()
        .from(urlTable)
        .where(eq(urlTable.userId, req.user.id));

    return res.json({ codes });
}

const deleteURL = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = req.params.id;

    const [deleted] = await db
        .delete(urlTable)
        .where(and(eq(urlTable.id, id), eq(urlTable.userId, req.user.id)))
        .returning({ id: urlTable.id });

    if (!deleted) {
        return res.status(404).json({ error: 'URL not found or unauthorized' });
    }

    return res.status(200).json({ deleted: true, id: deleted.id });
}

const getAllURL = async (req: Request, res: Response) => {
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
    shortURL, orgURL, deleteURL, getAllURL
}