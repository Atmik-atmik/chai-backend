class ApiResponse{
    constructor(statusCode, data, message){
        this.statusCode= statusCode
        this.data= data
        this.message= message
        this.success= statusCode <400 //there are limits for status code for operation
    }
}

export {ApiResponse};