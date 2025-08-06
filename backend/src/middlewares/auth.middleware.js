import  {ApiError}  from "../utils/ApiError.js";
import  {asyncHandler}  from "../utils/asyncHandlers.js";
import  jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";


export   const verifyJWT =asyncHandler(async (req, res, next) => {
    try {
        const token =
        req.cookies?.token || 
        req.cookies?.accessToken || req.header
        ("Authorization")?.replace("Bearer ", "") 
       
    
        if(!token){
            throw new ApiError(401,"unauthorized request");
        }
    
    const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const userId = decodedToken._id || decodedToken.id; 
    const user = await User.findById(userId).select("-password -refreshToken");
    if(!user){
        throw new ApiError(401, "invalide token access");
    }
    req.user=user;
    next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access Token");
        
    }
})