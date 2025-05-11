import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv'; // Import dotenv

// Load environment variables from .env file
dotenv.config(); // This line loads the variables into process.env

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});



const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        //upload the file on cloudanary
       const response = await  cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //file uploadded
        //console.log("file is uplaoded on cloudnary",response.url);
        fs.unlinkSync(localFilePath);
        return response;
    }catch(error){
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}




export { uploadOnCloudinary };
