import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  refreshToken: {
    type: String,
    default: "",
  },
});

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (error) {
    console.log("error in hashing password");
  }
});

userSchema.methods.isCorrectPassword = async function (password) {
    try {
        const result = await bcrypt.compare(password,this.password);
        return result;
    } catch (error) {
        console.log(`error in comparing passwords`);
        throw error;
    }
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESSTOKENKEY,
    { expiresIn: process.env.ACCESSTOKENEXPIRY }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESHTOKENKEY,
    {
      expiresIn: process.env.REFRESHTOKENEXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
