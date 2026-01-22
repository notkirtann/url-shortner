import 'dotenv/config'
import express from 'express'
import chalk from 'chalk'

const app = express()
const PORT = process.env.PORT

app.listen(PORT,()=>{
    console.log(chalk.bgGreen(`server started successfully at Port No: ${PORT}`));
})