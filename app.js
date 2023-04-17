// TODO: port forwarding!!!

const express = require("express");
const app = express();
const port = 3000;

const indexRouter = require("./routes/index");
const postsRouter = require("./routes/posts");

const connect = require("./schemas");

connect();

app.use(express.json());

app.use("/api", [indexRouter, postsRouter]);

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
