import { db } from '../db/index.ts';
import { userTable } from '../models/index.ts';
import { eq } from 'drizzle-orm';

export async function getUserByEmail(email: string) {
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

export async function getUserById(id: string) {
  const [user] = await db
    .select({
      id: userTable.id,
      firstname: userTable.firstName,
      lastname: userTable.lastName,
      email: userTable.email,
      salt: userTable.salt,
      password: userTable.password,
    })
    .from(userTable)
    .where(eq(userTable.id, id));

  return user;
}

export async function updateUserById(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    password?: string;
    salt?: string;
  }
) {
  const [updatedUser] = await db
    .update(userTable)
    .set(data)
    .where(eq(userTable.id, id))
    .returning({
      id: userTable.id,
      firstName: userTable.firstName,
      lastName: userTable.lastName,
      email: userTable.email,
    });

  return updatedUser;
}

export async function deleteUserById(id: string) {
  const [deletedUser] = await db
    .delete(userTable)
    .where(eq(userTable.id, id))
    .returning({
      id: userTable.id,
    });

  return deletedUser;
}