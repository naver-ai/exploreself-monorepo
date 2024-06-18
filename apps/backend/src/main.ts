import express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import testRouter from './routes/test';
import cors from 'cors'

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.options("*", cors());

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
});

app.use("/test", testRouter)

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

server.on('error', console.error);
