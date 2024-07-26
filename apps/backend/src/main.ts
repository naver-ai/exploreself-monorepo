import express, { Router } from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import authRouter from './routes/auth'
import userRouter from './routes/user'
import questionRouter from './routes/question'
import responseRouter from './routes/response'
import threadRouter from './routes/thread'
import themeRouter from './routes/theme'

import cors from 'cors'
import mongoose, { mongo } from 'mongoose'; 
import { User } from './config/schema';

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
  .then(async () => {
    console.log('MongoDB connected!')

    const testUser = await User.findOne({alias: "test"})
    if(!testUser){
      console.log("Create test user...")
      const newUser = await new User({
        alias: "test",
        name: "송인화",
        passcode: "12345",
        isKorean: true
      }).save()
      console.log("Created new user: ", newUser.toJSON())
    }

  })
  .catch(error => console.log(error))
app.use(express.json());
// app.use("/", testRouter)
const apiRouter = express.Router()
apiRouter.use("/auth", authRouter)
apiRouter.use("/user", userRouter)
apiRouter.use("/question", questionRouter)
apiRouter.use("/response", responseRouter)
apiRouter.use("/thread", threadRouter)
apiRouter.use("/theme", themeRouter)

apiRouter.get("/ping", (req, res) => {
  res.send("Server responds.")
})

app.use("/api/v1", apiRouter)

const port = process.env.BACKEND_PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

server.on('error', console.error);