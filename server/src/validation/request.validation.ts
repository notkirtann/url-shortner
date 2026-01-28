import {z} from 'zod'

export const signupPostReqBodySchema =z.object({
    firstName: z.string(),
    lastName :z.string(),
    email:z.string().email(),
    password:z.string().min(6)
})

export const loginPostReqBodySchema = z.object({
    email: z.string().email().min(1),
    password: z.string().min(1)
})

export const shortenPostRequestBodySchema = z.object({
  url: z.string().url(),
  code: z.string().optional(),
});
