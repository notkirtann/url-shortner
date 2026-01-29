import 'dotenv/config'
import express from 'express'
import type {Request, Response} from 'express'
import chalk from 'chalk'
import {userRoutes,urlRoutes} from './routes/routes.ts'
import { authenticationMiddleware } from './middleware/auth.middleware.ts'

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json())
app.use(authenticationMiddleware)

//health check route
app.get('/',(req: Request, res: Response)=>{
    console.log(chalk.blueBright('All the routes are working fine'));
    return res.json(['All route are working fine',{routeInfo:'/info'}]);
})
app.get('/info',(req: Request, res: Response)=>{
    return res.json([
                     {'main-route':['/user/login','/user/signup','/user/update','/user/delete']},
                     {'url-route':['/shorten','/codes','/:shortCode','/:id']},
                     [{NOTE:'without login you cant use below listed task'},  {'Authenticated-url-Route':['/shotern','/:id','/codes']}]
                    ])
})


app.use(urlRoutes)
app.use('/user',userRoutes)

app.listen(PORT,()=>{
    console.log(chalk.bgGreen(`server started successfully at Port No: ${PORT}`));
})