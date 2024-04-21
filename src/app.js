import express from "express";
import userRouter from "./routes/user.routes.js";
import todoRouter from "./routes/todo.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10kb" })); //for incoming requests in jdon format
app.use(express.urlencoded({ extended: true })); // for incoming requests in url
app.use(express.static("Public"));

app.use("/users", userRouter);
app.use("/todo",todoRouter);

export { app };
