import { asyncHandler } from '../utils/asyncHandlers.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generatesAccessAndRefereshToken = async(userId)=>{
    try{
const user =await User.findByIdAndUpdate(userId);
   const accessToken=user.generatesAccessToken()
   const refreshToken=user.generatesRefreshToken()

   user.refreshToken=refreshToken;
   await user.save({validateBeforeSave: false});

   return{accessToken, refreshToken}
    }catch (error) {
        console.error("Error generating access and refresh tokens:", error);
        throw new ApiError(500, "Internal server error");
    }
}

const registerUser= asyncHandler(async (req, res) => {
const{username,email,password}=req.body
console.log("email:",email);
if(
    [username,email,password].some((field)=>field?.trim()==="")
    ){
throw new ApiError(400,"All fields are required")
    }

   const existedUser=  await User.findOne({email})
   if (existedUser) {
    throw new ApiError(409, "User already exists with this email");
   }
    const user=await User.create({username,email,password})
   const createdUser =await User.findById(user._id).select("-password -refreshToken");

   if(!createdUser){
    throw new ApiError(500, "User registration failed");
   }
   return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
   );
});
const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generatesAccessAndRefereshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser=asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(req.user._id, {
$set:{
    refreshToken:undefined
}
},
{
    new: true
}
)
const options={
    httpOnly: true,
    secure: true
}
return res.status(200)
.clearCookie("accessToken", options)
.json(
    new ApiResponse(200, {}, "User logged out successfully")
)
})



export { 
    registerUser ,
    loginUser,
    logoutUser
};