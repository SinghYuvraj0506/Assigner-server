import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";


// genrate tokens -------------
export const generateUserAccessAndRefreshToken = async (userId: string) => {
    try {
      const user = await User.findById(userId);
  
      const accessToken = user?.generateAccessToken();
      const refreshToken = user?.generateRefreshToken();
  
      if (user && refreshToken) {
        user.refreshToken = refreshToken;
      }
  
      await user?.save();
  
      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(500, "Something went wrong in genrating tokens");
    }
  };
