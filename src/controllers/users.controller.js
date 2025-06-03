import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"


const generateRefreshAndAccessTokens = async(userId)=>{
    try {
        const user= await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()

        user.accessToken= accessToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


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
    // console.log("email: ",email);


     //validation - not empty / or wrong info syntax
    if([fullName, email,username,password].some((field) => field?.trim()=== "") )
    {
        throw new ApiError(400, "fullname is required")
    }


    //check if user already exists : username, email
    const existedUser= await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "Username with email or username already exists")
    }

    //check for images, check for avatar
    console.log("FILES RECEIVED:", req.files);

    const avatarLocalPath= req.files?.avatar[0]?.path;
    // const coverImageLocalPath= req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath= req.files.coverImage[0].path
    }

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

    //chekcing if user is created and removing password and refreshtoken

    const createdUser= await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    //returning user

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
});

const loginUser = asyncHandler(async(req,res) => {
    //1 req body ->data
    //2 username or email
    //3 find the user
    //4 password check
    //5 access and refresh token
    //6 send cookie

    //1 && 2
    const {email,username,password} = req.body

    if(!username && !email){
        throw new ApiError(400,"username or email is required.")
    }

    //3
    const user= await User.findOne({
        $or: [{username},{email}] //it search either username or email exist or not
    })

    if(!user){
        throw new ApiError(404, "User not found")
    }

    //4
    const IsvalidPassword = await user.isPasswordCorrect(password) //here is user is small letter because its varial not model name

    if(!IsvalidPassword){
        throw new ApiError(404, "Invalid password")
    }

    //5
    const {accessToken, refreshToken}= await generateRefreshAndAccessTokens(user._id)

    //6

    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken, option)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
                
            },
            "User logged in Successfully"
        )
    )
})

const logoutUser= asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }
    )

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200,{}, "User logged Out"))
}) 

const refreshAccessToken = asyncHandler(async(req,res)=> {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incommingRefreshToken){
        throw new ApiError(401, "unauthorised request")
    }

    try {
        const decodedToken =   jwt.verify(
           incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refreshToken")
        }
    
        if(incommingRefreshToken != user?.refreshAccessToken){
            throw new ApiError(401, "RefreshToken is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure : true
        }
    
        const {accessToken, newRefreshToken} =   await generateRefreshAndAccessTokens(user.id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            200,
            {accessToken, refreshToken : newRefreshToken},
            "Access Token refreshed"
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword, newPassword} = req.body

    const user= await User.findById(req.user?._id)
    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password= newPassword
    await user.save({validateBeforSave: false})
    
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully."))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully.")
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required.")
    }

    const user = User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath= req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
    throw new ApiError(400, "Error while uploading avatar")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }

        },

        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath= req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image  file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
    throw new ApiError(400, "Error while uploading coverImage")

    }

    const  user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }

        },

        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "CoverImage updated successfully"))
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage

}