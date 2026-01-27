import { createHmac, randomBytes } from "node:crypto";

const hashPasswordWithSalt = (password:any)=>{
    const salt = randomBytes(256).toString('hex')
    const hashedPass = createHmac('sha-256',salt).update(password).digest('hex')

    return {salt,hashedPass}
} 

export {
    hashPasswordWithSalt
}