import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
  //details
  //validate
  //save into db with hashing the password
  //create accessToken and refreshToken and save.
  //return res
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    throw new ApiError(401, "all fields required");
  }
  let exists = await User.findOne({ username });
  if (exists) {
    throw new ApiError(401, "username already exists");
  }
  exists = await User.findOne({ email });
  if (exists) {
    throw new ApiError(401, "email already exists");
  }

  const newUser = new User({
    username: username.toLowerCase().trim(),
    email,
    password,
  });
  await newUser
    .save()
    .then(() => {
      console.log("ok");
    })
    .catch((err) => {
      throw new ApiError(501, "error in registering the user");
    });

  return res
    .status(201)
    .json(new ApiResponse(201, { newUser }, "user registered successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  let { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(401, "username or email is required");
  }
  if (!password) {
    throw new ApiError(401, "password is required");
  }
  if (username) {
    username = username.toLowerCase().trim();
  }
  if (email) {
    email = email.toLowerCase().trim();
  }

  let user = await User.findOne({ username });
  if (!user) {
    user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, "username or email doesnot exists");
    }
  }

  const result = await user.isCorrectPassword(password);
  console.log("password compare :", result);
  if (!result) {
    throw new ApiError(401, "wrong password");
  }

  const accessToken = await user.generateAccessToken();
  if (!accessToken) {
    throw new ApiError(501, "error in generating access token");
  }

  const refreshToken = await user.generateRefreshToken();
  if (!refreshToken) {
    throw new ApiError(501, "error in generating refreshToken");
  }

  let updatedUser = await User.findOneAndUpdate(
    {
      $or: [{ username }, { email }],
    },
    { refreshToken },
    { new: true } // to return the updated user.
  ).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(501, "error in updating or finding user");
  }

  console.log(`updated user : ${updatedUser}`);

  const options = {
    httpOnly: true, //cookie is only accessible to the server and not to the client side
    secure: true, // cookie is sent over through HTTPS in encrypted form.
  };

  res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(201, { user: updatedUser }, "user loggedin successfully!")
    );
});

const logoutUser = asyncHandler(async (req, res) => {

  const user = await User.findOneAndUpdate(
    { _id: req.user?._id },
    { refreshToken: "" }
  )

  if (!user) {
    throw new ApiError(401, "user not found");
  }

  res
    .status(201)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(201, "user logout successfully."));
});

export { registerUser, loginUser , logoutUser };
