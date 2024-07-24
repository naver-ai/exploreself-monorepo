import express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import userRouter from './newRoutes/user'
import adminRouter from './newRoutes/admin'
import questionRouter from './newRoutes/question'
import responseRouter from './newRoutes/response'
import threadRouter from './newRoutes/thread'
import themeRouter from './newRoutes/theme'

import cors from 'cors'
import mongoose, { mongo } from 'mongoose'; 

process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';
if (process.env.NODE_ENV == 'production') {
  console.log("Production Mode");
} else if (process.env.NODE_ENV == 'development') {
  console.log("Development Mode");
}
const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.json({type: 'application/json; charset=utf-8'}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.options("*", cors());

const uri = 'mongodb://localhost:27017/';
const dbName = 'reauthor';

mongoose.connect(uri + dbName)
  .then(() => console.log('MongoDB connected!'))
  .catch(error => console.log(error))
app.use(express.json());
// app.use("/", testRouter)
app.use("/user", userRouter)
app.use("/admin", adminRouter)
app.use("/question", questionRouter)
app.use("/response", responseRouter)
app.use("/thread", threadRouter)
app.use("/theme", themeRouter)

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

server.on('error', console.error);