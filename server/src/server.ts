import 'dotenv/config'
import express from 'express'
import type {NextFunction, Request,Response} from 'express'
import chalk from 'chalk'
import userRoutes from './routes/user.routes.ts'

const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.get('/',(req:Request,res:Response,next:NextFunction)=>{
    console.log(chalk.blueBright('All the routes are working fine'));
    return res.json('All the routes are working fine');
})

app.use('/user',userRoutes)

app.listen(PORT,()=>{
    console.log(chalk.bgGreen(`server started successfully at Port No: ${PORT}`));
})