import 'dotenv/config'
import express from 'express'
import type {Request, Response} from 'express'
import cors from 'cors';
import chalk from 'chalk'
import swaggerUi from 'swagger-ui-express';
import { resolve } from 'path';
import YAML from 'yamljs';
import {userRoutes,urlRoutes} from './routes/routes.ts'
import { authenticationMiddleware } from './middleware/auth.middleware.ts'

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json())
app.use(cors())
app.use(authenticationMiddleware)

app.use('/user',userRoutes)

//swagger
const swaggerSpec = YAML.load(resolve('./swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(urlRoutes)

//health check route
app.get('/',(req: Request, res: Response)=>{
    console.log(chalk.blueBright('All the routes are working fine'));
    return res.json(['All route are working fine',{routeInfo:'/api-docs'}]);
})

app.listen(PORT,()=>{
    console.log(chalk.bgGreen(`server started successfully at Port No: ${PORT}`));
})