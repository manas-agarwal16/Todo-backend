import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Todo } from "../models/todo.model.js";
import mongoose from "mongoose";

const newTodo = asyncHandler(async (req, res) => {
  const { content } = req.body;
  console.log(content);
  if (!content) {
    throw new ApiError(401, "content is required");
  }
  const exists = await Todo.findOne({ content });
  if (exists) {
    throw new ApiError(401, "todo already exists");
  }
  const newTask = new Todo({
    content,
    user_id: req.user._id,
  });

  await newTask
    .save()
    .then(() => {
      console.log("new todo added successfully");
    })
    .catch((err) => {
      throw new ApiError(501, "error in adding new todo");
    });

  res
    .status(201)
    .json(new ApiResponse(201, newTask, "new todo added successfully!!!"));
});

const getTodos = asyncHandler(async (req, res) => {
  const allTodos = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "todos",
        localField: "_id",
        foreignField: "user_id",
        as: "TODOS",
      },
    },
    {
      $project: {
        TODOS: 1,
      },
    },
  ]);

  if (!allTodos) {
    throw new ApiError(401, "user does not found");
  }

  const onlyTodos = allTodos[0]?.TODOS;

  res
    .status(201)
    .json(new ApiResponse(201, onlyTodos, "user todos fetched successfully"));
});

const deleteTodo = asyncHandler(async (req, res) => {
  const { content } = req.body; //always exists

  if (!content) {
    throw new ApiError(401, "content to be deleted is required");
  }

  const contentToDelete = await Todo.aggregate([
    {
      $match: {
        user_id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $match: {
        content: content,
      },
    },
  ]);

  if (contentToDelete.length <= 0) {
    throw new ApiError(401, "content to delete not found");
  }

  const deleteResult = await Todo.findOneAndDelete({
    content: contentToDelete[0].content,
  }); //deleteResult will store the document deleted or null if not found.

  console.log(deleteResult);
  if (!deleteResult) {
    throw new ApiError(501, "todo not found");
  }

  res
    .status(201)
    .json(
      new ApiResponse(201, deleteResult, "content is deleted successfully!")
    );
});

const updateTodo = asyncHandler(async (req, res) => {
  const { oldContent, newContent } = req.body;
  if (!newContent) {
    throw new ApiError(401, "new Content is required");
  }
  if (!oldContent) {
    throw new ApiError(501, "old content is required from frontend");
  }

  const todoToUpdate = await Todo.aggregate([
    {
      $match: {
        user_id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $match: {
        content: oldContent,
      },
    },
  ]);
  if (todoToUpdate.length === 0) {
    throw new ApiError(401, "todo not found");
  }

  const idOfTodoToUpdate = todoToUpdate[0]?._id;

  const update = await Todo.findOneAndUpdate(
    { _id: idOfTodoToUpdate },
    { content: newContent }
  );

  if (!update) {
    throw new ApiError(401, "oldContent not found");
  }

  res.status(201).json(new ApiResponse(201, update, "todo updated successfully!!"));
});


export { newTodo, deleteTodo, getTodos, updateTodo };
