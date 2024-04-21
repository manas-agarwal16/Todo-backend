import mongoose from "mongoose";

const connectdb = async () => {
  try {
    const connect = await mongoose.connect(`${process.env.MONGODB_URL}`);
    console.log("db is connected successfully!!!");
  } catch (error) {
    console.log("error in db connecting");
    throw error;
  }
};

export { connectdb };
