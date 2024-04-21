import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    default : "",
  },
  content: {
    type: String,
    require: true,
    unique : true,
  },
});

export const Todo = mongoose.model("Todo", todoSchema);
