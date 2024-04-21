import { ApiError } from "../utils/Apierror.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const decodeJWT = asyncHandler(async (req, _, next) => {
  try {

    const { accessToken, refreshToken } = req.cookies;

    if ( !accessToken || !refreshToken ) {
      throw new ApiError(401, "invalid request");
    }

    const decodedAccessToken = await jwt.verify(
      accessToken,
      process.env.ACCESSTOKENKEY
    );


    if (!decodedAccessToken) {
      throw new ApiError(501, "error in decoding accessToken");
    }

    const user = await User.findOne({ _id: decodedAccessToken._id }).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "invalid request");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(501, "user has already logged out" , error);
  }
});

export { decodeJWT };
