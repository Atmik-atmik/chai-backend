import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";

const registerUser= asyncHandler(async(req,res) => {
    //get user details from frontend(here postman)
    //validation - not empty / or wrong info syntax
    //check if user already exists : username, email
    //check for images, check for avatar
    //create user object -create entry in db
    //remove password and refresh token field from responce
    //check for user creation
    //return response


    //get user details from frontend(here postman)
    const {fullName, email,username, password}= req.body
    console.log("email: ",email);


     //validation - not empty / or wrong info syntax
    if([fullName, email,username,password].some((field) => field?.trim()=== "") )
    {
        throw new ApiError(400, "fullname is required")
    }


    //check if user already exists : username, email
    const existedUser= User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "Username with email or username already exists")
    }

    //check for images, check for avatar
    const avatarLocalPath= req.files?.avatar[0]?.path;
    const coverImageLocalPath= req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required.")
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required.")
    }

    // 6️⃣ Create user object - create entry in DB

   const user= await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

});

export {registerUser}