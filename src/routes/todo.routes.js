import express from "express";
import {
  newTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from "../controllers/todo.controller.js";
import { decodeJWT } from "../middlewares/Token.js";

const router = express();

router.route("/my-todos").get(decodeJWT, getTodos);

router.route("/new-todo").post(decodeJWT, newTodo);

router.route("/delete-todo").delete(decodeJWT, deleteTodo);

router.route("/update-todo").post(decodeJWT,updateTodo);

export default router;
