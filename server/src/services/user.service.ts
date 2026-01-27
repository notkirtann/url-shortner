import { db } from '../db/index.ts';
import { userTable } from '../models/index.ts';
import { eq } from 'drizzle-orm';

export async function getUserByEmail(email:string) {
  const [existingUser] = await db
    .select({
      id: userTable.id,
      firstname: userTable.firstName,
      lastname: userTable.lastName,
      email: userTable.email,
      salt: userTable.salt,
      password: userTable.password,
    })
    .from(userTable)
    .where(eq(userTable.email, email));

  return existingUser;
}
