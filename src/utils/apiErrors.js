//This class is used to create custom error objects for APIs, giving more meaningful structure to error responses than the default Error class .

class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors= [],
        stack= "",
    ){
        super(message)
        this.statusCode= statusCode
        this.data= null
        this.message= message
        this.success= false;
        this.errors= errors

        if (stack){
            this.stack= stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}

export{ApiError}