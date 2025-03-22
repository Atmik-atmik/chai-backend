// The asyncHandler is a helper function that catches errors in async/await route functions, so you don’t have to write try...catch blocks manually in every route.


const asyncHandler= (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).
        catch((err) => next(err))
    }
}

export {asyncHandler}



// const asyncHandler = (fun) => async (req, res, next) =>{  // this is high level fuciton formate, where fuc is given as parameter

//     try {
        
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
        
//     }
// }