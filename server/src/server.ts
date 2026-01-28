import 'dotenv/config'
import express from 'express'
import type {Response} from 'express'
import chalk from 'chalk'
import {userRoutes,urlRoutes} from './routes/routes.ts'
import { authenticationMiddleware } from './middleware/auth.middleware.ts'

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json())
app.use(authenticationMiddleware)
app.get('/',(res:Response)=>{
    console.log(chalk.blueBright('All the routes are working fine'));
    return res.json('All the routes are working fine');
})
app.use(urlRoutes)
app.use('/user',userRoutes)

app.listen(PORT,()=>{
    console.log(chalk.bgGreen(`server started successfully at Port No: ${PORT}`));
})