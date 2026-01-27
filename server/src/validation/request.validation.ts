import { z} from 'zod'

export const signupPostReqBodySchema =z.object({
    firstName: z.string(),
    lastName :z.string(),
    email:z.string().email(),
    password:z.string().min(6)
})