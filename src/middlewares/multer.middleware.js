import multer from "multer";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/public/temp')
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
})
  


export   const upload = multer({ 
  
    storage,

 })


 //i created below when there was error of avatar  but bug was in env cloudanry data 


// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Construct the full path to /public/temp directory
// const tempDir = path.join(process.cwd(), "public", "temp");

// // Create the directory if it doesn't exist
// if (!fs.existsSync(tempDir)) {
//   fs.mkdirSync(tempDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, tempDir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// export const upload = multer({
//   storage,
// });
