
import {pgTable,text,timestamp,uuid, varchar} from 'drizzle-orm/pg-core'

export const userTable = pgTable('users',{
    id:uuid().primaryKey().defaultRandom(),
    firstName:varchar('first_name',{length:55}).notNull(),
    lastName:varchar('last_name',{length:55}),
    email:varchar({length:100}).unique().notNull(),
    password:text().notNull(),
    salt:text().notNull(),
    createdAt:timestamp('created-At').defaultNow().notNull(),
    updatedAt:timestamp('updated-At').$onUpdate(()=>new Date())
}); 