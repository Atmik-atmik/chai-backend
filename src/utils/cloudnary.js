import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


// Configuration
cloudinary.config({ 
    cloud_name: process.env.cloud_name, 
    api_key: process.env.api_key, 
    api_secret: process.env.api_secret // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudnary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        //upload the file on cloudanary
       const response = await  cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //file uploadded
        console.log("file is uplaoded on cloudnary",response.url);
        return response;
    }catch(error){
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}