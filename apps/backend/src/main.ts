import express from 'express';
import * as path from 'path';
import * as fs from 'fs-extra'
import * as bodyParser from 'body-parser';
import userRouter from './router/user'
import authRouter from './router/auth'
import questionRouter from './router/question'
import responseRouter from './router/response'
import threadRouter from './router/thread'
import themeRouter from './router/theme'
import generateRouter from './router/generate'
import interactionRouter from './router/interaction'
import adminAuthRouter from './router/admin/auth'
import adminUserRouter from './router/admin/user'
import adminDataRouter from './router/admin/data'
import * as morgan from 'morgan'
import cors from 'cors'
import mongoose from 'mongoose';
import { User } from './config/schema';
import { signedInAdminUserMiddleware } from './router/admin/middleware';
import { initSocket } from './socket';

process.env.NODE_ENV = (process.env.NODE_ENV && (process.env.NODE_ENV).trim().toLowerCase() == 'production') ? 'production' : 'development';
if (process.env.NODE_ENV == 'production') {
  console.log("Production Mode");
} else if (process.env.NODE_ENV == 'development') {
  console.log("Development Mode");
}
const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '100mb' }));
app.use(bodyParser.text({ limit: '10mb' }))
app.use(cors());
app.options("*", cors());

app.use(morgan("combined"))

mongoose.connect(process.env.MONGODB_URL + process.env.MONGODB_DBNAME)
  .then(async () => {
    console.log('MongoDB connected!')

    const testUser = await User.findOne({ alias: "test" })
    if (!testUser) {
      console.log("Create test user...")
      const newUser = await new User({
        alias: "test",
        name: undefined,
        passcode: "12345",
        isKorean: true
      }).save()
      console.log("Created new user: ", newUser.toJSON())
    }
  })
  .catch(error => console.log(error))
// app.use("/", testRouter)
const apiRouter = express.Router()
apiRouter.use("/user", userRouter)
apiRouter.use("/auth", authRouter)
apiRouter.use("/question", questionRouter)
apiRouter.use("/response", responseRouter)
apiRouter.use("/threads", threadRouter)
apiRouter.use("/themes", themeRouter)
apiRouter.use("/generate", generateRouter)
apiRouter.use("/interaction", interactionRouter)
apiRouter.use("/admin/auth", adminAuthRouter)
apiRouter.use("/admin/users", signedInAdminUserMiddleware, adminUserRouter)
apiRouter.use("/admin/data", signedInAdminUserMiddleware, adminDataRouter)


apiRouter.get("/ping", (req, res) => {
  res.send("Server responds.")
})

app.use("/api/v1", apiRouter)

const frontend_dist_path = path.join(__dirname, '../frontend-web')
console.log(frontend_dist_path)
if (fs.existsSync(frontend_dist_path)) {
  console.log("Serve frontend file on backend.")
  const frontend_dist_index_path = path.join(frontend_dist_path, 'index.html')
  app.use(express.static(frontend_dist_path))
  app.get("*", (req, res) => {
    res.sendFile(frontend_dist_index_path)
  })
} else {
  console.log("No distribution files for frontend was found. If you want to serve it on the backend, please run 'nx build frontend-web' in advance.")
}

const port = process.env.BACKEND_PORT != null ? Number.parseInt(process.env.BACKEND_PORT) : 3000;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Listening at ${process.env.BACKEND_HOSTNAME}:${port}`);
});

initSocket(server, [`${process.env.BACKEND_HOSTNAME}:3000`, `${process.env.BACKEND_HOSTNAME}:4200`])

server.on('error', console.error);